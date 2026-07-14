"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { galaxyNodes, type GalaxyNode } from "@/lib/galaxy/nodes";
import {
  CONVERGE_MS,
  FOCUS_MS,
  RETURN_MS,
  clamp01,
  easeInOutCubic,
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
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.6);
    gl_FragColor = vec4(vec3(0.88, 0.9, 0.95), fresnel * uIntensity);
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
        uniforms: { uIntensity: { value: 0.35 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  const glowRef = useRef<THREE.Sprite>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const shockRef = useRef<THREE.Mesh>(null);
  const shockMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const glowMap = useMemo(() => getGlowTexture(), []);
  const baseColor = useMemo(() => new THREE.Color("#c9c9cf"), []);
  const brightColor = useMemo(() => new THREE.Color("#f4f4f7"), []);

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

    const { phase, phaseStart, hoveredId, focusedId, selectedId } =
      useGalaxyStore.getState();
    const now = performance.now();
    const isActive = hoveredId === node.id || focusedId === node.id;
    const isSelected = selectedId === node.id;
    const inTransition =
      phase === "converging" || phase === "focusing" || phase === "returning";
    const damp = 1 - Math.exp(-delta * 8);

    // Idle float + subtle rotation
    if (phase !== "project") {
      const t = state.clock.elapsedTime;
      const floatY = Math.sin(t * 0.3 + node.position[0]) * 0.14;
      group.position.set(node.position[0], node.position[1] + floatY, node.position[2]);
      if (sphereRef.current) sphereRef.current.rotation.y += delta * 0.08;
    }

    // Scale: hover 1.05, selected node expands during focus, shrinks on return
    let targetScale = isActive ? 1.05 : 1;
    if (isSelected && phase === "focusing") {
      const p = easeOutExpo(clamp01((now - phaseStart) / FOCUS_MS));
      targetScale = 1 + (EXPAND_RADIUS / node.radius - 1) * p;
      group.scale.setScalar(targetScale);
    } else if (isSelected && phase === "project") {
      group.scale.setScalar(EXPAND_RADIUS / node.radius);
    } else if (isSelected && phase === "returning") {
      const p = easeInOutCubic(clamp01((now - phaseStart) / RETURN_MS));
      group.scale.setScalar(
        EXPAND_RADIUS / node.radius + (1 - EXPAND_RADIUS / node.radius) * p,
      );
    } else {
      group.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        damp,
      );
    }

    // Brightness: silver → near-white on selection; unrelated nodes dim away
    const dimmed = inTransition && !isSelected;
    const emissiveTarget = isSelected && phase !== "exploring" ? 0.5 : isActive ? 0.22 : 0.05;
    material.emissiveIntensity +=
      (emissiveTarget - material.emissiveIntensity) * damp;
    material.color.lerp(isSelected && inTransition ? brightColor : baseColor, damp);
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
      const show = (isActive || (isSelected && phase === "converging")) && phase !== "project";
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
          color="#c9c9cf"
          metalness={1}
          roughness={0.26}
          envMapIntensity={1.05}
          emissive="#dfe0e6"
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
          color="#e8e8ee"
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
          color="#ffffff"
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
        <div ref={labelRef} className="node-label" data-visible="false">
          <span className="node-label__rule" aria-hidden />
          {node.label}
        </div>
      </Html>
    </group>
  );
}
