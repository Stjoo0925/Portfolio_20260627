"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Vector3 } from "three";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import type { Section } from "@/lib/content/schema";

/**
 * Moves the camera through the section nodes based on scroll progress.
 * progress 0 -> node[0], 1 -> node[last], interpolated across segments.
 */
export function CameraRig({ sections }: { sections: Section[] }) {
  const { camera } = useThree();
  const { progress } = useScrollProgress();
  const target = useMemo(() => new Vector3(), []);
  const look = useMemo(() => new Vector3(), []);

  useFrame(() => {
    if (sections.length === 0) return;

    const p = progress * (sections.length - 1);
    const i = Math.min(Math.floor(p), sections.length - 2);
    const local = p - i;

    const a = sections[i].node;
    const b = sections[i + 1].node;

    target.set(
      a[0] + (b[0] - a[0]) * local,
      a[1] + (b[1] - a[1]) * local + 1.5,
      a[2] + (b[2] - a[2]) * local + 4,
    );
    look.set(
      a[0] + (b[0] - a[0]) * local,
      a[1] + (b[1] - a[1]) * local,
      a[2] + (b[2] - a[2]) * local,
    );

    camera.position.lerp(target, 0.1);
    camera.lookAt(look);
  });

  return null;
}
