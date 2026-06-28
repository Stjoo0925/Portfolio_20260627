"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Vector3 } from "three";
import { getFluidParticlePreset } from "@/lib/section-routes";
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
  const targetPos = useMemo(() => new Vector3(), []);
  const targetLook = useMemo(() => new Vector3(), []);
  const smoothPos = useRef(new Vector3(0, 0.5, 11));
  const smoothLook = useRef(new Vector3(0, 0, 0));

  useFrame((state, delta) => {
    if (sections.length === 0) return;

    const preset = getFluidParticlePreset(activeSectionId);
    const time = state.clock.elapsedTime;
    const drift = preset.camera.drift;
    const speed = preset.camera.driftSpeed;

    const orbitX = Math.sin(time * speed) * drift;
    const orbitY = Math.cos(time * speed * 0.7) * drift * 0.35;

    targetPos.set(
      preset.camera.position[0] + orbitX,
      preset.camera.position[1] + orbitY,
      preset.camera.position[2],
    );
    targetLook.set(
      preset.camera.lookAt[0],
      preset.camera.lookAt[1],
      preset.camera.lookAt[2],
    );

    smoothPos.current.lerp(targetPos, delta * 1.2);
    smoothLook.current.lerp(targetLook, delta * 1.2);

    camera.position.copy(smoothPos.current);
    camera.lookAt(smoothLook.current);

    invalidate();
  });

  return <WakeCanvas activeSectionId={activeSectionId} />;
}
