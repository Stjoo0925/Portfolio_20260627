"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildConnectionCurves } from "@/lib/galaxy/curves";
import { useGalaxyStore } from "@/store/galaxy-store";

/** Thin curved silver paths between important nodes; brighten on hover. */
export function ConnectionLines() {
  const lines = useMemo(
    () =>
      buildConnectionCurves().map(({ from, to, curve }) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color("#ffffff"),
          transparent: true,
          opacity: 0.07,
          depthWrite: false,
        });
        return { from, to, line: new THREE.Line(geometry, material), material };
      }),
    [],
  );

  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const { hoveredId, focusedId, selectedId, phase } = useGalaxyStore.getState();
    if (phase === "project") return;
    const activeId = selectedId ?? hoveredId ?? focusedId;
    const damp = 1 - Math.exp(-delta * 7);

    for (const entry of lines) {
      const touchesActive =
        activeId !== null && (entry.from === activeId || entry.to === activeId);
      const target = touchesActive ? 0.32 : 0.07;
      entry.material.opacity += (target - entry.material.opacity) * damp;
    }
  });

  return (
    <group ref={groupRef}>
      {lines.map((entry) => (
        <primitive key={`${entry.from}-${entry.to}`} object={entry.line} />
      ))}
    </group>
  );
}
