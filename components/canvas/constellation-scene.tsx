"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  Vector3,
  type Group,
  type Mesh,
} from "three";
import { theme } from "@/lib/theme";
import type { Section } from "@/lib/content/schema";

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function createStarGeometry(count: number, seed: number, spread = 1) {
  const random = seededRandom(seed);
  const positions: number[] = [];
  const colors: number[] = [];
  const cyan = new Color(theme.color.accent);
  const gold = new Color(theme.color.gold);
  const white = new Color("#e8f4ff");

  for (let i = 0; i < count; i += 1) {
    const t = random();
    const x = -9 + random() * 46 * spread;
    const y = -9 + random() * 18 * spread;
    const z = 10 - random() * 54 * spread;
    const drift = Math.sin(i * 17.17) * 0.65;
    const color = white.clone().lerp(t > 0.82 ? gold : cyan, random() * 0.55);

    positions.push(x + drift, y, z);
    colors.push(color.r, color.g, color.b);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));

  return geometry;
}

function createGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext("2d");
  if (!context) return new CanvasTexture(canvas);

  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(95, 212, 255, 0.55)");
  gradient.addColorStop(0.28, "rgba(95, 212, 255, 0.22)");
  gradient.addColorStop(0.58, "rgba(244, 194, 95, 0.08)");
  gradient.addColorStop(1, "rgba(5, 7, 13, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function ConstellationScene({
  sections,
  activeSectionId,
}: {
  sections: Section[];
  activeSectionId: string;
}) {
  const groupRef = useRef<Group>(null);
  const nodeRefs = useRef<(Mesh | null)[]>([]);
  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === activeSectionId),
  );
  const deepStars = useMemo(() => createStarGeometry(2200, 24, 1.1), []);
  const nearStars = useMemo(() => createStarGeometry(900, 71, 0.78), []);
  const glowTexture = useMemo(() => createGlowTexture(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.025;
      groupRef.current.position.y = Math.sin(t * 0.12) * 0.06;
    }

    nodeRefs.current.forEach((mesh, index) => {
      if (!mesh) return;
      const isActive = index === activeIndex;
      const pulse = isActive ? 1 + Math.sin(t * 3) * 0.25 : 1;
      mesh.scale.setScalar(pulse);
      const mat = mesh.material as { emissiveIntensity?: number };
      mat.emissiveIntensity = isActive ? 3.2 : 0.65;
    });
  });

  const points = sections.map((s) => s.node as [number, number, number]);

  return (
    <group ref={groupRef}>
      <points geometry={deepStars}>
        <pointsMaterial
          size={0.035}
          transparent
          opacity={0.58}
          vertexColors
          sizeAttenuation
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>

      <points geometry={nearStars}>
        <pointsMaterial
          size={0.07}
          transparent
          opacity={0.72}
          vertexColors
          sizeAttenuation
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>

      <sprite position={[9, 0.5, -14]} scale={[22, 14, 1]}>
        <spriteMaterial
          map={glowTexture}
          transparent
          opacity={0.42}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </sprite>

      <sprite position={[24, 2.6, -25]} scale={[16, 10, 1]}>
        <spriteMaterial
          map={glowTexture}
          transparent
          opacity={0.24}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </sprite>

      {points.slice(0, -1).map((start, i) => (
        <Line
          key={`link-${i}`}
          points={[start, points[i + 1]]}
          color={i === activeIndex - 1 || i === activeIndex ? theme.color.gold : theme.color.accent}
          lineWidth={i === activeIndex - 1 || i === activeIndex ? 2.2 : 0.9}
          transparent
          opacity={i === activeIndex - 1 || i === activeIndex ? 0.62 : 0.16}
        />
      ))}

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
            color={i === activeIndex ? theme.color.gold : theme.color.accent}
            emissive={i === activeIndex ? theme.color.gold : theme.color.accent}
            emissiveIntensity={1}
            metalness={0.4}
            roughness={0.2}
          />
        </mesh>
      ))}

      <ActiveBeacon sections={sections} activeIndex={activeIndex} />
    </group>
  );
}

function ActiveBeacon({
  sections,
  activeIndex,
}: {
  sections: Section[];
  activeIndex: number;
}) {
  const groupRef = useRef<Group>(null);
  const target = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    const active = sections[activeIndex];
    if (!active || !groupRef.current) return;

    target.fromArray(active.node);
    groupRef.current.position.lerp(target, 0.08);
    groupRef.current.rotation.x = state.clock.elapsedTime * 0.18;
    groupRef.current.rotation.z = state.clock.elapsedTime * 0.28;
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.008, 16, 96]} />
        <meshStandardMaterial
          color={theme.color.gold}
          emissive={theme.color.gold}
          emissiveIntensity={1.6}
          transparent
          opacity={0.82}
          metalness={0.8}
          roughness={0.18}
        />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[1.08, 0.006, 16, 120]} />
        <meshStandardMaterial
          color={theme.color.accent}
          emissive={theme.color.accent}
          emissiveIntensity={0.9}
          transparent
          opacity={0.42}
          metalness={0.8}
          roughness={0.22}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshBasicMaterial
          color={theme.color.accent}
          transparent
          opacity={0.09}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
