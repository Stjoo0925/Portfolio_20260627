"use client";

import { Canvas } from "@react-three/fiber";
import { CameraRig } from "./camera-rig";
import { ConstellationScene } from "./constellation-scene";
import { theme } from "@/lib/theme";
import type { Section } from "@/lib/content/schema";

export function Experience({
  sections,
  frameloop = "always",
}: {
  sections: Section[];
  frameloop?: "always" | "demand" | "never";
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={frameloop}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 1.5, 4], fov: 45 }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 2]} intensity={3} color={theme.color.accent} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-3, -2, -4]} intensity={1} color={theme.color.gold} />
      <ConstellationScene sections={sections} />
      <CameraRig sections={sections} />
    </Canvas>
  );
}
