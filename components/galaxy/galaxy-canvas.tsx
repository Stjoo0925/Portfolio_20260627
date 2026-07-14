"use client";

import { Canvas } from "@react-three/fiber";
import { GalaxyEnvironment } from "@/components/galaxy/galaxy-environment";
import { BackgroundParticles } from "@/components/galaxy/background-particles";
import { SupportingNodes } from "@/components/galaxy/supporting-nodes";
import { ConnectionLines } from "@/components/galaxy/connection-lines";
import { ElectronSystem } from "@/components/galaxy/electron-system";
import { InteractiveNodes } from "@/components/galaxy/interactive-nodes";
import { CameraRig } from "@/components/galaxy/camera-rig";
import { useGalaxyStore } from "@/store/galaxy-store";

export default function GalaxyCanvas() {
  const perfLevel = useGalaxyStore((state) => state.perfLevel);

  return (
    <Canvas
      dpr={perfLevel === "low" ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ fov: 55, near: 0.1, far: 160, position: [0, 1.2, 26] }}
      onCreated={({ gl }) => {
        gl.setClearColor("#000000");
      }}
    >
      <GalaxyEnvironment />
      <BackgroundParticles />
      <SupportingNodes />
      <ConnectionLines />
      <ElectronSystem />
      <InteractiveNodes />
      <CameraRig />
    </Canvas>
  );
}
