"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { MathUtils } from "three";
import { generateShapePositions } from "@/lib/fluid/shape-positions";
import {
  particleFragmentShader,
  particleVertexShader,
} from "@/lib/fluid/particle-shaders";
import { getFluidParticlePreset } from "@/lib/section-routes";

const PARTICLE_COUNT = 8000;
const BASE_SHAPE = "sphere" as const;
const BASE_SPREAD = 4.5;

function hexToVec3(hex: string) {
  const color = new THREE.Color(hex);
  return new THREE.Vector3(color.r, color.g, color.b);
}

export function FluidParticles({ activeSectionId }: { activeSectionId: string }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);
  const preset = getFluidParticlePreset(activeSectionId);

  const geometry = useMemo(() => {
    const positions = generateShapePositions(PARTICLE_COUNT, BASE_SHAPE, BASE_SPREAD);
    const seed = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      seed[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return geo;
  }, []);

  const uniforms = useMemo(() => {
    const p = getFluidParticlePreset(activeSectionId);
    return {
      uTime: { value: 0 },
      uTurbulence: { value: p.particle.turbulence },
      uCurlScale: { value: p.particle.curlScale },
      uSpeed: { value: p.particle.speed },
      uSize: { value: p.particle.size },
      uSpread: { value: 1 },
      uColorPrimary: { value: hexToVec3(p.colors.primary) },
      uColorSecondary: { value: hexToVec3(p.colors.secondary) },
      uColorAccent: { value: hexToVec3(p.colors.accent) },
      uGlow: { value: p.particle.glow },
    };
  }, [activeSectionId]);

  const colorTargets = useRef({
    primary: hexToVec3(preset.colors.primary),
    secondary: hexToVec3(preset.colors.secondary),
    accent: hexToVec3(preset.colors.accent),
    turbulence: preset.particle.turbulence,
    curlScale: preset.particle.curlScale,
    speed: preset.particle.speed,
    size: preset.particle.size,
    glow: preset.particle.glow,
  });

  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    const next = getFluidParticlePreset(activeSectionId);
    const t = colorTargets.current;

    t.primary.lerp(hexToVec3(next.colors.primary), delta * 1.2);
    t.secondary.lerp(hexToVec3(next.colors.secondary), delta * 1.2);
    t.accent.lerp(hexToVec3(next.colors.accent), delta * 1.2);
    t.turbulence = MathUtils.lerp(t.turbulence, next.particle.turbulence, delta * 1.2);
    t.curlScale = MathUtils.lerp(t.curlScale, next.particle.curlScale, delta * 1.2);
    t.speed = MathUtils.lerp(t.speed, next.particle.speed, delta * 1.2);
    t.size = MathUtils.lerp(t.size, next.particle.size, delta * 1.2);
    t.glow = MathUtils.lerp(t.glow, next.particle.glow, delta * 1.2);

    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uTurbulence.value = t.turbulence;
    mat.uniforms.uCurlScale.value = t.curlScale;
    mat.uniforms.uSpeed.value = t.speed;
    mat.uniforms.uSize.value = t.size;
    mat.uniforms.uColorPrimary.value.copy(t.primary);
    mat.uniforms.uColorSecondary.value.copy(t.secondary);
    mat.uniforms.uColorAccent.value.copy(t.accent);
    mat.uniforms.uGlow.value = t.glow;

    invalidate();
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}
