"use client";

/* eslint-disable react-hooks/immutability -- three.js objects are animated
   imperatively inside the R3F frame loop; they are not React-rendered state */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { findNodeByPathname, nodeById } from "@/lib/galaxy/nodes";
import { clamp01, useGalaxyStore } from "@/store/galaxy-store";

const Y_AXIS = new THREE.Vector3(0, 1, 0);

/**
 * Shared GPU infall path for the opening sequence. Each particle waits for
 * its stagger delay, then flies from its scattered spawn point (aStart) to
 * its resting spiral position along a bowed arc. `form` 0→1 drives the whole
 * sequence; at form >= 1 the path collapses to the resting position exactly.
 */
const FORM_PATH_GLSL = /* glsl */ `
  float formProgress(float delay, float form) {
    return clamp((form - delay * 0.55) / 0.45, 0.0, 1.0);
  }

  vec3 formPos(vec3 target, vec3 start, float delay, float form) {
    float p = formProgress(delay, form);
    float e = 1.0 - pow(1.0 - p, 3.0);
    vec3 dir = target - start;
    vec3 side = normalize(cross(dir, vec3(0.0, 1.0, 0.001)) + vec3(0.0001));
    vec3 pos = mix(start, target, e);
    pos += side * sin(e * 3.14159265) * length(dir) * 0.1 * (delay - 0.5);
    return pos;
  }
`;

const VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aStart;
  attribute float aDelay;
  uniform float uTime;
  uniform float uForm;
  uniform vec3 uLensPos;
  uniform float uLensStrength;
  varying float vAlpha;

  ${FORM_PATH_GLSL}

  void main() {
    vec3 p = formPos(position, aStart, aDelay, uForm);

    // Gravity lens: stars near the hovered node drift into its well and
    // brighten, as if the sphere's mass bends the starlight around it
    vec3 toLens = uLensPos - p;
    float lensDist = length(toLens);
    float pull = uLensStrength * smoothstep(9.0, 1.4, lensDist);
    p += (toLens / max(lensDist, 0.001)) * pull * 1.5;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depthFade = clamp(1.0 - (-mv.z - 8.0) / 90.0, 0.12, 1.0);
    float twinkle = 0.72 + 0.28 * sin(uTime * 0.6 + aPhase);
    float prog = formProgress(aDelay, uForm);
    // Pre-flight stars sit dim in the void; they flare while travelling
    float moving = sin(prog * 3.14159265);
    vAlpha = depthFade * twinkle * mix(0.3, 1.0, prog) * (1.0 + pull * 0.9);
    gl_PointSize = aSize * twinkle * (1.0 + moving * 0.9) * (160.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(uColor, a * vAlpha * 0.8);
  }
`;

/**
 * Light-streak companion layer: one 2-vertex line per streaked particle.
 * Two modes share the geometry (they never overlap in time):
 * - forming: stretched between the infall path "now" and slightly in the
 *   past; brightness follows travel speed, so only flight leaves a trace.
 * - warp (focusing/returning): classic hyperspace — the tail is displaced
 *   radially outward from the screen centre in view space, so every star
 *   becomes a speed line pointing away from the travel direction.
 */
const STREAK_VERTEX = /* glsl */ `
  attribute vec3 aStart;
  attribute float aDelay;
  attribute float aEnd;
  uniform float uForm;
  uniform float uWarp;
  varying float vAlpha;

  ${FORM_PATH_GLSL}

  void main() {
    vec3 head = formPos(position, aStart, aDelay, uForm);
    vec3 tail = formPos(position, aStart, aDelay, uForm - 0.05);
    vec4 mvHead = modelViewMatrix * vec4(head, 1.0);
    vec4 mvTail = modelViewMatrix * vec4(tail, 1.0);
    vec4 mv = mix(mvHead, mvTail, aEnd);

    // Hyperspace stretch: longer further from the screen centre (tunnel)
    vec2 radial = mvHead.xy;
    float rlen = max(length(radial), 0.2);
    mv.xy += (radial / rlen) * (uWarp * uWarp * (2.2 + rlen * 0.6)) * aEnd;

    float formSpeed = distance(head, tail);
    float formFade = 1.0 - smoothstep(0.85, 1.0, uForm);
    float formAlpha = smoothstep(0.06, 1.4, formSpeed) * 0.5 * formFade;
    float warpDepth = clamp(1.0 - (-mvHead.z - 10.0) / 80.0, 0.15, 1.0);
    float warpAlpha = uWarp * 0.6 * warpDepth;
    vAlpha = max(formAlpha, warpAlpha) * (1.0 - aEnd * 0.82);
    gl_Position = projectionMatrix * mv;
  }
`;

const STREAK_FRAGMENT = /* glsl */ `
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(vec3(0.92, 0.94, 1.0), vAlpha);
  }
`;

/** Seeded pseudo-random so the field is stable between mounts. */
function makeRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Scattered pre-formation spawn point on a wide shell around the scene. */
function scatterPoint(random: () => number, out: { x: number; y: number; z: number }) {
  const radius = 46 + random() * 42;
  const theta = random() * Math.PI * 2;
  const phi = Math.acos(2 * random() - 1);
  out.x = radius * Math.sin(phi) * Math.cos(theta);
  out.y = radius * Math.sin(phi) * Math.sin(theta) * 0.75;
  out.z = radius * Math.cos(phi) - 8;
}

export function BackgroundParticles() {
  const groupRef = useRef<THREE.Group>(null);
  const streakRef = useRef<THREE.LineSegments>(null);
  const perfLevel = useGalaxyStore((state) => state.perfLevel);
  const count = perfLevel === "low" ? 1200 : 2800;
  const streakCount = perfLevel === "low" ? 320 : 1000;

  const { geometry, material, streakGeometry, streakMaterial } = useMemo(() => {
    const random = makeRandom(1337);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const starts = new Float32Array(count * 3);
    const delays = new Float32Array(count);
    const spawn = { x: 0, y: 0, z: 0 };

    for (let i = 0; i < count; i += 1) {
      let x: number;
      let y: number;
      let z: number;

      if (random() < 0.62) {
        // Two-arm spiral disc: dense core, sparse rim
        const r = Math.pow(random(), 0.65) * 40;
        const arm = random() > 0.5 ? 0 : Math.PI;
        const angle = random() * Math.PI * 2 * 0.22 + arm + r * 0.16;
        const spreadY = (random() + random() + random() - 1.5) * (2.6 - r * 0.03);
        x = Math.cos(angle) * r;
        z = Math.sin(angle) * r - 10;
        y = spreadY;
      } else {
        // Sparse spherical halo so the field extends past the viewport
        const radius = 22 + random() * 42;
        const theta = random() * Math.PI * 2;
        const phi = Math.acos(2 * random() - 1);
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
        z = radius * Math.cos(phi) - 12;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      sizes[i] = 0.35 + random() * 1.15;
      phases[i] = random() * Math.PI * 2;

      scatterPoint(random, spawn);
      starts[i * 3] = spawn.x;
      starts[i * 3 + 1] = spawn.y;
      starts[i * 3 + 2] = spawn.z;
      delays[i] = random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aStart", new THREE.BufferAttribute(starts, 3));
    geo.setAttribute("aDelay", new THREE.BufferAttribute(delays, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uForm: { value: 1 },
        uLensPos: { value: new THREE.Vector3(0, 0, -999) },
        uLensStrength: { value: 0 },
        uColor: { value: new THREE.Color(0.85, 0.86, 0.9) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // Streak layer reuses the first streakCount particles' path data,
    // duplicated for the head (aEnd 0) and tail (aEnd 1) vertices.
    const sPositions = new Float32Array(streakCount * 2 * 3);
    const sStarts = new Float32Array(streakCount * 2 * 3);
    const sDelays = new Float32Array(streakCount * 2);
    const sEnds = new Float32Array(streakCount * 2);

    for (let i = 0; i < streakCount; i += 1) {
      for (let v = 0; v < 2; v += 1) {
        const idx = i * 2 + v;
        sPositions[idx * 3] = positions[i * 3];
        sPositions[idx * 3 + 1] = positions[i * 3 + 1];
        sPositions[idx * 3 + 2] = positions[i * 3 + 2];
        sStarts[idx * 3] = starts[i * 3];
        sStarts[idx * 3 + 1] = starts[i * 3 + 1];
        sStarts[idx * 3 + 2] = starts[i * 3 + 2];
        sDelays[idx] = delays[i];
        sEnds[idx] = v;
      }
    }

    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute("position", new THREE.BufferAttribute(sPositions, 3));
    sGeo.setAttribute("aStart", new THREE.BufferAttribute(sStarts, 3));
    sGeo.setAttribute("aDelay", new THREE.BufferAttribute(sDelays, 1));
    sGeo.setAttribute("aEnd", new THREE.BufferAttribute(sEnds, 1));

    const sMat = new THREE.ShaderMaterial({
      vertexShader: STREAK_VERTEX,
      fragmentShader: STREAK_FRAGMENT,
      uniforms: { uForm: { value: 1 }, uWarp: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat, streakGeometry: sGeo, streakMaterial: sMat };
  }, [count, streakCount]);

  const lens = useRef({ strength: 0, pos: new THREE.Vector3(0, 0, -999) });

  useFrame((state, delta) => {
    const { phase, phaseStart, formingMs, focusMs, returnMs, hoveredId, focusedId } =
      useGalaxyStore.getState();
    const now = performance.now();
    const forming = phase === "forming";
    const form = forming ? clamp01((now - phaseStart) / formingMs) : 1;

    // Warp is reserved for the node-selection fly-in/out only — it used to
    // also fire on ordinary fast mouse movement while idly exploring, which
    // diluted the "hyperspace" beat into background noise.
    let warp = 0;
    if (phase === "focusing") {
      const p = clamp01((now - phaseStart) / focusMs);
      warp = p * p;
    } else if (phase === "returning") {
      const p = clamp01((now - phaseStart) / returnMs);
      warp = (1 - p) * (1 - p) * 0.7;
    }

    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uForm.value = form;
    streakMaterial.uniforms.uForm.value = form;
    streakMaterial.uniforms.uWarp.value = warp;

    // Particle star tint lerps towards active route accent color
    const selectedId = useGalaxyStore.getState().selectedId;
    const activeNode = selectedId
      ? nodeById.get(selectedId)
      : (typeof window !== "undefined" ? findNodeByPathname(window.location.pathname) : null);
    const targetColor = new THREE.Color(0.85, 0.86, 0.9);
    if ((phase === "project" || phase === "focusing") && activeNode) {
      targetColor.set(activeNode.accent).lerp(new THREE.Color(0.85, 0.86, 0.9), 0.7);
    }
    (material.uniforms.uColor.value as THREE.Color).lerp(
      targetColor,
      1 - Math.exp(-delta * 3.5),
    );

    // Gravity lens follows the hovered/keyboard-focused node while exploring
    const lensNode =
      phase === "exploring" && (hoveredId ?? focusedId)
        ? nodeById.get((hoveredId ?? focusedId)!)
        : null;
    const lensDamp = 1 - Math.exp(-delta * 6);
    lens.current.strength +=
      ((lensNode ? 1 : 0) - lens.current.strength) * lensDamp;
    if (lensNode && groupRef.current) {
      // Node positions are world-space; particles live inside the slowly
      // rotating group, so counter-rotate the lens centre to match
      lens.current.pos
        .set(...lensNode.position)
        .applyAxisAngle(Y_AXIS, -groupRef.current.rotation.y);
    }
    material.uniforms.uLensStrength.value = lens.current.strength;
    (material.uniforms.uLensPos.value as THREE.Vector3).copy(lens.current.pos);

    if (streakRef.current) streakRef.current.visible = forming || warp > 0.003;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (forming ? 0.0012 : 0.0045);
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} frustumCulled={false} />
      <lineSegments
        ref={streakRef}
        geometry={streakGeometry}
        material={streakMaterial}
        visible={false}
        frustumCulled={false}
      />
    </group>
  );
}
