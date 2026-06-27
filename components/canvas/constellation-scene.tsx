"use client";

import { Line, Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { theme } from "@/lib/theme";
import type { Section } from "@/lib/content/schema";

export function ConstellationScene({ sections }: { sections: Section[] }) {
  const groupRef = useRef<Group>(null);
  const nodeRefs = useRef<(Mesh | null)[]>([]);
  const { progress } = useScrollProgress();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = progress * (sections.length - 1);
    const activeIndex = Math.round(p);

    nodeRefs.current.forEach((mesh, index) => {
      if (!mesh) return;
      const isActive = index === activeIndex;
      const pulse = isActive ? 1 + Math.sin(t * 3) * 0.25 : 1;
      mesh.scale.setScalar(pulse);
      const mat = mesh.material as { emissiveIntensity?: number };
      mat.emissiveIntensity = isActive ? 2.4 : 0.8;
    });
  });

  const points = sections.map((s) => s.node as [number, number, number]);

  return (
    <group ref={groupRef}>
      <Stars
        radius={60}
        depth={40}
        count={3000}
        factor={3}
        saturation={0}
        fade
        speed={0.6}
      />

      {/* Links between consecutive nodes */}
      {points.slice(0, -1).map((start, i) => (
        <Line
          key={`link-${i}`}
          points={[start, points[i + 1]]}
          color={theme.color.accent}
          lineWidth={1}
          transparent
          opacity={0.35}
        />
      ))}

      {/* Section nodes */}
      {sections.map((s, i) => (
        <mesh
          key={s.id}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
          position={s.node}
        >
          <icosahedronGeometry args={[0.18, 1]} />
          <meshStandardMaterial
            color={theme.color.accent}
            emissive={theme.color.accent}
            emissiveIntensity={1}
            metalness={0.4}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Gold accent ring around the active path midpoint */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[12.5, 0.5, -10]}>
        <torusGeometry args={[1.4, 0.01, 16, 80]} />
        <meshStandardMaterial
          color={theme.color.gold}
          emissive={theme.color.gold}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}
