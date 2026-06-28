"use client";

import { Canvas } from "@react-three/fiber";
import { CameraRig } from "./camera-rig";
import { ConstellationScene } from "./constellation-scene";
import { getSectionVisualPreset } from "@/lib/section-routes";
import type { Section } from "@/lib/content/schema";

export function Experience({
  sections,
  activeSectionId,
  frameloop = "demand",
}: {
  sections: Section[];
  activeSectionId: string;
  frameloop?: "always" | "demand" | "never";
}) {
  const preset = getSectionVisualPreset(activeSectionId);

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={frameloop}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 1.5, 4], fov: 45 }}
    >
      <ambientLight intensity={preset.atmosphere === "dawn" ? 0.42 : 0.3} />
      <pointLight position={[0, 0, 2]} intensity={3} color={preset.primary} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-3, -2, -4]} intensity={1} color={preset.tertiary} />
      <ConstellationScene sections={sections} activeSectionId={activeSectionId} />
      <CameraRig sections={sections} activeSectionId={activeSectionId} />
    </Canvas>
  );
}
