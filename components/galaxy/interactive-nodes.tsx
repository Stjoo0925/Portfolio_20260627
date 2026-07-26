"use client";

/* eslint-disable react-hooks/immutability -- three.js objects are animated
   imperatively inside the R3F frame loop; they are not React-rendered state */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { galaxyNodes, nodeById, type GalaxyNode } from "@/lib/galaxy/nodes";
import {
  CONVERGE_MS,
  clamp01,
  easeOutExpo,
  useGalaxyStore,
} from "@/store/galaxy-store";

/** World radius the selected sphere grows to while it swallows the camera. */
const EXPAND_RADIUS = 7;

const FRESNEL_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRESNEL_FRAGMENT = /* glsl */ `
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.6);
    gl_FragColor = vec4(uColor, fresnel * uIntensity);
  }
`;

let glowTexture: THREE.CanvasTexture | null = null;

/** Shared soft radial glow sprite texture, generated once on the client. */
function getGlowTexture() {
  if (glowTexture) return glowTexture;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,0.55)");
  gradient.addColorStop(0.35, "rgba(216,216,224,0.16)");
  gradient.addColorStop(1, "rgba(216,216,224,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  glowTexture = new THREE.CanvasTexture(canvas);
  return glowTexture;
}

export function InteractiveNodes() {
  return (
    <group>
      {galaxyNodes.map((node) => (
        <InteractiveNode key={node.id} node={node} />
      ))}
    </group>
  );
}

function InteractiveNode({ node }: { node: GalaxyNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const shellMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: FRESNEL_VERTEX,
        fragmentShader: FRESNEL_FRAGMENT,
        uniforms: {
          uIntensity: { value: 0.35 },
          uColor: { value: new THREE.Color(node.accent) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [node.accent],
  );
  const restScale = useRef(new THREE.Vector3(1, 1, 1));
  const restPosition = useRef(new THREE.Vector3());
  const glowRef = useRef<THREE.Sprite>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const shockRef = useRef<THREE.Mesh>(null);
  const shockMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const glowMap = useMemo(() => getGlowTexture(), []);
  const accentColor = useMemo(() => new THREE.Color(node.accent), [node.accent]);
  const baseColor = useMemo(
    () => new THREE.Color("#c9c9cf").lerp(new THREE.Color(node.accent), 0.42),
    [node.accent],
  );
  const brightColor = useMemo(
    () => new THREE.Color("#f4f4f7").lerp(new THREE.Color(node.accent), 0.45),
    [node.accent],
  );

  const selectNode = () => {
    const store = useGalaxyStore.getState();
    if (store.phase !== "exploring") return;
    store.setSelected(node.id);
    store.setPhase("converging");
  };

  useFrame((state, delta) => {
    const group = groupRef.current;
    const material = materialRef.current;
    if (!group || !material) return;

    const {
      phase,
      phaseStart,
      hoveredId,
      focusedId,
      selectedId,
      formingMs,
      focusMs,
    } = useGalaxyStore.getState();

    group.visible = true;
    const now = performance.now();

    if (phase === "project") {
      const activeNode = selectedId ? nodeById.get(selectedId) : null;
      const isCurrentRouteNode = activeNode ? activeNode.id === node.id : false;
      const damp = 1 - Math.exp(-delta * 6);

      const targetOpacity = isCurrentRouteNode ? 1.0 : 0.32;
      const targetEmissive = isCurrentRouteNode ? 0.45 : 0.05;

      material.opacity += (targetOpacity - material.opacity) * damp;
      material.emissiveIntensity += (targetEmissive - material.emissiveIntensity) * damp;
      material.emissive.lerp(accentColor, damp);

      // "focusing" grows this sphere to swallow the camera (see EXPAND_RADIUS
      // below); without settling it back to its resting scale/position here,
      // it stays stuck oversized for as long as the route page is visible.
      const t = state.clock.elapsedTime;
      const floatY = Math.sin(t * 0.3 + node.position[0]) * 0.08;
      restPosition.current.set(node.position[0], node.position[1] + floatY, node.position[2]);
      group.position.lerp(restPosition.current, damp);
      group.scale.lerp(restScale.current, damp);

      if (glowRef.current) {
        const spriteMaterial = glowRef.current.material as THREE.SpriteMaterial;
        const glowTarget = isCurrentRouteNode ? 0.42 : 0.08;
        spriteMaterial.opacity += (glowTarget - spriteMaterial.opacity) * damp;
      }
      if (ringMaterialRef.current) {
        const ringTarget = isCurrentRouteNode ? 0.5 : 0;
        ringMaterialRef.current.opacity += (ringTarget - ringMaterialRef.current.opacity) * damp;
      }
      if (labelRef.current) labelRef.current.dataset.visible = "false";
      return;
    }

    // Opening: the node condenses out of the infalling stars — scale-up from
    // nothing with a bright birth flash that decays into the idle look.
    if (phase === "forming") {
      const formP = clamp01((now - phaseStart) / formingMs);
      const order = galaxyNodes.findIndex((n) => n.id === node.id);
      const p = clamp01((formP - (0.5 + order * 0.055)) / 0.24);
      const e = easeOutExpo(p);
      const flash = Math.sin(Math.min(1, p * 1.2) * Math.PI);

      group.position.set(node.position[0], node.position[1], node.position[2]);
      group.scale.setScalar(Math.max(0.0001, e));
      material.opacity = e;
      material.color.copy(baseColor).lerp(brightColor, flash);
      material.emissive.copy(accentColor);
      material.emissiveIntensity = 0.11 + flash * 1.5;
      shellMaterial.uniforms.uIntensity.value = 0.32 * e + flash * 0.9;

      if (glowRef.current) {
        const spriteMaterial = glowRef.current.material as THREE.SpriteMaterial;
        spriteMaterial.opacity = 0.14 * e + flash * 0.5;
      }
      if (ringMaterialRef.current) ringMaterialRef.current.opacity = 0;
      if (shockRef.current) shockRef.current.visible = false;
      if (labelRef.current) labelRef.current.dataset.visible = "false";
      return;
    }
    const isActive = hoveredId === node.id || focusedId === node.id;
    const isSelected = selectedId === node.id;
    const inTransition =
      phase === "converging" || phase === "focusing" || phase === "returning";
    const damp = 1 - Math.exp(-delta * 8);

    // Idle float + subtle rotation
    const t = state.clock.elapsedTime;
    const floatY = Math.sin(t * 0.3 + node.position[0]) * 0.08;
    group.position.set(node.position[0], node.position[1] + floatY, node.position[2]);
    if (sphereRef.current) sphereRef.current.rotation.y += delta * 0.08;

    // Scale: hover 1.05; the selected node expands while the camera flies in
    const targetScale = isActive ? 1.05 : 1;
    if (isSelected && phase === "focusing") {
      const p = easeOutExpo(clamp01((now - phaseStart) / focusMs));
      group.scale.setScalar(1 + (EXPAND_RADIUS / node.radius - 1) * p);
    } else {
      group.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        damp,
      );
    }

    // Brightness: silver → near-white on selection; unrelated nodes dim away
    const dimmed = inTransition && !isSelected;
    const emissiveTarget =
      isSelected && phase !== "exploring"
        ? 0.5
        : isActive
          ? 0.22
          : node.featured
            ? 0.16
            : 0.11;
    material.emissiveIntensity +=
      (emissiveTarget - material.emissiveIntensity) * damp;
    material.emissive.lerp(accentColor, damp);
    material.color.lerp(
      isSelected && inTransition ? brightColor : isActive ? accentColor : baseColor,
      damp,
    );
    material.opacity += ((dimmed ? 0.22 : 1) - material.opacity) * damp;

    const shellTarget = isSelected && inTransition ? 0.85 : isActive ? 0.7 : 0.32;
    shellMaterial.uniforms.uIntensity.value +=
      (shellTarget - shellMaterial.uniforms.uIntensity.value) * damp;

    if (glowRef.current) {
      const glowTarget = dimmed ? 0.04 : isSelected && inTransition ? 0.5 : isActive ? 0.34 : 0.14;
      const spriteMaterial = glowRef.current.material as THREE.SpriteMaterial;
      spriteMaterial.opacity += (glowTarget - spriteMaterial.opacity) * damp;
    }

    // Orbit ring appears on hover / selection
    if (ringRef.current && ringMaterialRef.current) {
      const ringTarget = isActive || (isSelected && phase === "converging") ? 0.5 : 0;
      ringMaterialRef.current.opacity +=
        (ringTarget - ringMaterialRef.current.opacity) * damp;
      ringRef.current.rotation.z += delta * 0.4;
    }

    // Expanding circular shockwave right after selection
    if (shockRef.current && shockMaterialRef.current) {
      if (isSelected && (phase === "converging" || phase === "focusing")) {
        const elapsed =
          phase === "converging" ? now - phaseStart : now - phaseStart + CONVERGE_MS;
        const p = clamp01(elapsed / 900);
        shockRef.current.visible = p < 1;
        const s = node.radius * (1.4 + p * 6);
        shockRef.current.scale.setScalar(s);
        shockMaterialRef.current.opacity = 0.5 * (1 - easeOutExpo(p));
        shockRef.current.quaternion.copy(state.camera.quaternion);
      } else {
        shockRef.current.visible = false;
      }
    }

    // Label: visible on hover/focus, or while this node is being opened
    if (labelRef.current) {
      const show = isActive || (isSelected && phase === "converging");
      labelRef.current.dataset.visible = show ? "true" : "false";
    }
  });

  return (
    <group ref={groupRef} position={node.position}>
      <mesh
        ref={sphereRef}
        onPointerOver={(event) => {
          event.stopPropagation();
          if (useGalaxyStore.getState().phase !== "exploring") return;
          useGalaxyStore.getState().setHovered(node.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          if (useGalaxyStore.getState().hoveredId === node.id) {
            useGalaxyStore.getState().setHovered(null);
          }
          document.body.style.cursor = "";
        }}
        onClick={(event) => {
          event.stopPropagation();
          selectNode();
        }}
      >
        <sphereGeometry args={[node.radius, 48, 48]} />
        <meshStandardMaterial
          ref={materialRef}
          color={baseColor}
          metalness={1}
          roughness={0.26}
          envMapIntensity={1.05}
          emissive={node.accent}
          emissiveIntensity={0.05}
          transparent
        />
      </mesh>

      {/* Fresnel rim shell */}
      <mesh material={shellMaterial} raycast={() => null}>
        <sphereGeometry args={[node.radius * 1.06, 32, 32]} />
      </mesh>

      {/* Soft radial glow */}
      <sprite ref={glowRef} scale={node.radius * 6} raycast={() => null}>
        <spriteMaterial
          map={glowMap}
          color={node.accent}
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* Thin orbit ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2.6, 0, 0]} raycast={() => null}>
        <torusGeometry args={[node.radius * 1.75, 0.008, 8, 72]} />
        <meshBasicMaterial
          ref={ringMaterialRef}
          color={node.accent}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Selection shockwave */}
      <mesh ref={shockRef} visible={false} raycast={() => null}>
        <ringGeometry args={[0.92, 1, 64]} />
        <meshBasicMaterial
          ref={shockMaterialRef}
          color={node.accent}
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Html
        center
        position={[0, node.radius * 2.3, 0]}
        style={{ pointerEvents: "none" }}
        zIndexRange={[40, 0]}
      >
        <div
          ref={labelRef}
          className="node-label"
          data-visible="false"
          style={{ color: node.accent }}
        >
          <span className="node-label__rule" aria-hidden />
          {node.label}
        </div>
      </Html>
    </group>
  );
}
