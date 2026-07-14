"use client";

/* eslint-disable react-hooks/immutability -- three.js objects are animated
   imperatively inside the R3F frame loop; they are not React-rendered state */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGalaxyStore } from "@/store/galaxy-store";

const VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float depthFade = clamp(1.0 - (-mv.z - 8.0) / 90.0, 0.12, 1.0);
    float twinkle = 0.72 + 0.28 * sin(uTime * 0.6 + aPhase);
    vAlpha = depthFade * twinkle;
    gl_PointSize = aSize * twinkle * (160.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT = /* glsl */ `
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vec3(0.85, 0.86, 0.9), a * vAlpha * 0.8);
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

export function BackgroundParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const perfLevel = useGalaxyStore((state) => state.perfLevel);
  const count = perfLevel === "low" ? 1200 : 2800;

  const { geometry, material } = useMemo(() => {
    const random = makeRandom(1337);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);

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
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
  }, [count]);

  useFrame((state, delta) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.0045;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}
