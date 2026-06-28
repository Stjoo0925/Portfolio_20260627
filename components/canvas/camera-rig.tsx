"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { Vector3 } from "three";
import { getSectionVisualPreset } from "@/lib/section-routes";
import type { Section } from "@/lib/content/schema";

function WakeCanvas({ activeSectionId }: { activeSectionId: string }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [activeSectionId, invalidate]);

  useEffect(() => {
    const handler = () => invalidate();
    window.addEventListener("canvas:wake", handler);
    return () => window.removeEventListener("canvas:wake", handler);
  }, [invalidate]);

  return null;
}

export function CameraRig({
  sections,
  activeSectionId,
}: {
  sections: Section[];
  activeSectionId: string;
}) {
  const { camera } = useThree();
  const invalidate = useThree((state) => state.invalidate);
  const target = useMemo(() => new Vector3(), []);
  const look = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    if (sections.length === 0) return;

    const activeIndex = Math.max(
      0,
      sections.findIndex((section) => section.id === activeSectionId),
    );
    const active = sections[activeIndex];
    const node = active.node;
    const preset = getSectionVisualPreset(active.id);
    const time = state.clock.elapsedTime;
    const orbitX = Math.sin(time * preset.orbitSpeed) * preset.orbitRadius;
    const orbitZ =
      Math.cos(time * preset.orbitSpeed * 0.8) * preset.orbitRadius;
    const driftY = Math.sin(time * 0.21 + activeIndex) * preset.verticalDrift;

    target.set(
      node[0] + preset.cameraOffset[0] + orbitX,
      node[1] + preset.cameraOffset[1] + driftY,
      node[2] + preset.cameraOffset[2] + orbitZ,
    );
    look.set(
      node[0] + preset.lookOffset[0],
      node[1] + preset.lookOffset[1] + driftY * 0.25,
      node[2] + preset.lookOffset[2],
    );

    camera.position.lerp(target, 0.045);
    camera.lookAt(look);
    camera.rotateZ(
      Math.sin(time * preset.orbitSpeed * 1.7 + activeIndex) * preset.roll,
    );

    invalidate();
  });

  return <WakeCanvas activeSectionId={activeSectionId} />;
}
