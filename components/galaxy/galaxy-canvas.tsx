"use client";

/* eslint-disable react-hooks/immutability -- the bloom effect is driven
   imperatively inside the R3F frame loop; it is not React-rendered state */

import { useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BloomEffect } from "postprocessing";
import { GalaxyEnvironment } from "@/components/galaxy/galaxy-environment";
import { BackgroundParticles } from "@/components/galaxy/background-particles";
import { SupportingNodes } from "@/components/galaxy/supporting-nodes";
import { ElectronSystem } from "@/components/galaxy/electron-system";
import { InteractiveNodes } from "@/components/galaxy/interactive-nodes";
import { CameraRig } from "@/components/galaxy/camera-rig";
import { clamp01, easeAnticipate, useGalaxyStore } from "@/store/galaxy-store";

const BLOOM_BASE = 0.75;

/**
 * Owns the bloom effect instance (passed to the composer as a primitive so
 * no ref plumbing is needed) and pushes its intensity up through the warp
 * fly-in and back down on return.
 */
function CinematicEffects() {
  const bloom = useMemo(
    () =>
      new BloomEffect({
        intensity: BLOOM_BASE,
        luminanceThreshold: 0.35,
        luminanceSmoothing: 0.3,
        mipmapBlur: true,
      }),
    [],
  );

  useFrame(() => {
    const { phase, phaseStart, focusMs, returnMs } = useGalaxyStore.getState();
    const now = performance.now();
    let intensity = BLOOM_BASE;
    if (phase === "focusing") {
      // Held through the camera's pull-back beat, then flares sharply —
      // matching the sphere's own metal→emissive climax in interactive-nodes.
      const p = Math.max(0, easeAnticipate(clamp01((now - phaseStart) / focusMs)));
      intensity = BLOOM_BASE + 1.6 * p * p;
    } else if (phase === "returning") {
      const p = clamp01((now - phaseStart) / returnMs);
      intensity = BLOOM_BASE + 0.9 * (1 - p) * (1 - p);
    }
    bloom.intensity = intensity;
  });

  return (
    <EffectComposer>
      <primitive object={bloom} />
    </EffectComposer>
  );
}

export default function GalaxyCanvas() {
  const perfLevel = useGalaxyStore((state) => state.perfLevel);
  const phase = useGalaxyStore((state) => state.phase);
  const bloomActive = perfLevel === "high" && phase !== "project";

  return (
    <Canvas
      dpr={perfLevel === "low" ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ fov: 55, near: 0.1, far: 160, position: [0, 1.2, 26] }}
      onCreated={({ gl }) => {
        gl.setClearColor("#000000");
        // The opening may have been triggered while this canvas was still
        // loading (dynamic import + WebGL init). Restart its clock now so
        // the full sequence is actually visible from the first frame.
        const store = useGalaxyStore.getState();
        store.setCanvasReady(true);
        if (store.phase === "forming") store.setPhase("forming");
      }}
    >
      <GalaxyEnvironment />
      <BackgroundParticles />
      <SupportingNodes />
      <ElectronSystem />
      <InteractiveNodes />
      <CameraRig />
      {/* Cinematic glow on capable hardware only, and only while the galaxy
          is the thing being looked at — on project pages it's defocused and
          scrimmed behind page content, so the composer pass is pure waste */}
      {bloomActive && <CinematicEffects />}
    </Canvas>
  );
}
