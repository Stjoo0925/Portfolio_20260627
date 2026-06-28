"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { CameraRig } from "./camera-rig";
import { FluidParticles } from "./fluid-particles";
import { getFluidParticlePreset } from "@/lib/section-routes";
import type { Section } from "@/lib/content/schema";

function PostProcessingEffects() {
  return (
    <EffectComposer multisampling={2}>
      <Bloom
        luminanceThreshold={0.55}
        luminanceSmoothing={0.85}
        intensity={0.45}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.15} darkness={0.6} />
    </EffectComposer>
  );
}

export function Experience({
  sections,
  activeSectionId,
  frameloop = "demand",
}: {
  sections: Section[];
  activeSectionId: string;
  frameloop?: "always" | "demand" | "never";
}) {
  const preset = getFluidParticlePreset(activeSectionId);

  return (
    <Canvas
      dpr={[1, 1.25]}
      frameloop={frameloop}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: preset.camera.position, fov: 50, near: 0.1, far: 100 }}
    >
      <color attach="background" args={[preset.colors.background]} />

      <FluidParticles activeSectionId={activeSectionId} />
      <CameraRig sections={sections} activeSectionId={activeSectionId} />

      <PostProcessingEffects />
    </Canvas>
  );
}
