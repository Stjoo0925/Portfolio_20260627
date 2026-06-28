"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Vector3 } from "three";
import type { Section } from "@/lib/content/schema";

export function CameraRig({
  sections,
  activeSectionId,
}: {
  sections: Section[];
  activeSectionId: string;
}) {
  const { camera } = useThree();
  const target = useMemo(() => new Vector3(), []);
  const look = useMemo(() => new Vector3(), []);

  useFrame(() => {
    if (sections.length === 0) return;

    const activeIndex = Math.max(
      0,
      sections.findIndex((section) => section.id === activeSectionId),
    );
    const active = sections[activeIndex];
    const node = active.node;

    target.set(node[0] - 0.7, node[1] + 1.6, node[2] + 4.6);
    look.set(node[0] + 0.4, node[1] + 0.05, node[2] - 0.2);

    camera.position.lerp(target, 0.055);
    camera.lookAt(look);
  });

  return null;
}
