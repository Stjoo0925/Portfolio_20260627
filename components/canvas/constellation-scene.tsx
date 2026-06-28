"use client";

import { Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  Vector3,
  type Group,
  type Mesh,
  type SpriteMaterial,
} from "three";
import {
  getSectionVisualPreset,
  type SectionAtmosphere,
  type SectionVisualPreset,
} from "@/lib/section-routes";
import type { Section } from "@/lib/content/schema";

const starGeometryCache = new Map<string, BufferGeometry>();
const nebulaTextureCache = new Map<string, CanvasTexture>();

function atmosphereMultiplier(atmosphere: SectionAtmosphere) {
  switch (atmosphere) {
    case "storm":
      return { density: 1.2, opacity: 1.15, drift: 1.3 };
    case "dawn":
      return { density: 0.9, opacity: 0.95, drift: 0.85 };
    case "fog":
      return { density: 0.95, opacity: 1.05, drift: 1.0 };
    case "clear":
      return { density: 1.0, opacity: 0.9, drift: 0.9 };
    case "deep":
    default:
      return { density: 1.0, opacity: 1.0, drift: 1.0 };
  }
}

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function hexToRgb(hex: string) {
  const color = new Color(hex);
  return [
    Math.round(color.r * 255),
    Math.round(color.g * 255),
    Math.round(color.b * 255),
  ] as const;
}

function getStarGeometry(preset: SectionVisualPreset) {
  const cacheKey = `${preset.id}-${preset.starDensity}-${preset.turbulence}`;
  const cached = starGeometryCache.get(cacheKey);
  if (cached) return cached;

  const random = seededRandom(preset.id.length * 41 + 7);
  const count = Math.round(2100 * preset.starDensity);
  const positions: number[] = [];
  const colors: number[] = [];
  const primary = new Color(preset.primary);
  const secondary = new Color(preset.secondary);
  const tertiary = new Color(preset.tertiary);
  const dust = new Color(preset.dust);

  for (let i = 0; i < count; i += 1) {
    const band = random();
    const x = -12 + random() * 54;
    const y = -10 + random() * 20;
    const z = 12 - random() * 62;
    const spiral = Math.sin(i * 0.083 + band * 12) * preset.turbulence;
    const color = dust
      .clone()
      .lerp(band > 0.78 ? tertiary : band > 0.42 ? primary : secondary, 0.62);

    positions.push(x + spiral * 1.8, y + spiral * 0.45, z);
    colors.push(color.r, color.g, color.b);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  starGeometryCache.set(cacheKey, geometry);
  return geometry;
}

function getNebulaTexture(preset: SectionVisualPreset, seed: number) {
  const cacheKey = `${preset.id}-${seed}`;
  const cached = nebulaTextureCache.get(cacheKey);
  if (cached) return cached;

  const random = seededRandom(seed);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;

  const context = canvas.getContext("2d");
  if (!context) {
    const empty = new CanvasTexture(canvas);
    nebulaTextureCache.set(cacheKey, empty);
    return empty;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = "lighter";

  const palette = [
    hexToRgb(preset.primary),
    hexToRgb(preset.secondary),
    hexToRgb(preset.tertiary),
    hexToRgb(preset.dust),
  ];

  for (let i = 0; i < 20; i += 1) {
    const [r, g, b] = palette[i % palette.length];
    const x = canvas.width * (0.18 + random() * 0.64);
    const y = canvas.height * (0.16 + random() * 0.68);
    const radius = canvas.width * (0.12 + random() * 0.28);
    const alpha = (0.04 + random() * 0.11) * preset.cloudOpacity * 2;
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);

    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    gradient.addColorStop(0.38, `rgba(${r}, ${g}, ${b}, ${alpha * 0.42})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    context.fillStyle = gradient;
    context.beginPath();
    context.ellipse(
      x,
      y,
      radius * (1.3 + random() * 1.2),
      radius * (0.42 + random() * 0.5),
      random() * Math.PI,
      0,
      Math.PI * 2,
    );
    context.fill();
  }

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  nebulaTextureCache.set(cacheKey, texture);
  return texture;
}

export function ConstellationScene({
  sections,
  activeSectionId,
}: {
  sections: Section[];
  activeSectionId: string;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const groupRef = useRef<Group>(null);
  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === activeSectionId),
  );
  const activeSection = sections[activeIndex] ?? sections[0];
  const activePreset = getSectionVisualPreset(activeSection?.id ?? "hero");
  const atmosphere = atmosphereMultiplier(activePreset.atmosphere);
  const starGeometry = useMemo(
    () => getStarGeometry(activePreset),
    [activePreset],
  );
  const points = sections.map((s) => s.node as [number, number, number]);

  useEffect(() => {
    invalidate();
  }, [activeSectionId, invalidate]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (!groupRef.current) return;

    groupRef.current.rotation.y =
      Math.sin(time * 0.045) * 0.025 * activePreset.turbulence;
    groupRef.current.rotation.x =
      Math.cos(time * 0.035) * 0.018 * activePreset.turbulence;
    groupRef.current.position.y =
      Math.sin(time * 0.12 + activeIndex) *
      activePreset.verticalDrift *
      0.28 *
      atmosphere.drift;

    invalidate();
  });

  return (
    <group ref={groupRef}>
      <points geometry={starGeometry}>
        <pointsMaterial
          size={
            (0.046 + activePreset.turbulence * 0.018) * atmosphere.density
          }
          transparent
          opacity={0.62 * atmosphere.opacity}
          vertexColors
          sizeAttenuation
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>

      <NebulaCloud section={activeSection} preset={activePreset} />
      <SectionPath
        sections={sections}
        points={points}
        activeIndex={activeIndex}
      />
      {sections.map((section, index) => (
        <SectionNode
          key={section.id}
          section={section}
          isActive={index === activeIndex}
          distance={Math.abs(index - activeIndex)}
        />
      ))}
      <ActiveBeacon
        section={activeSection}
        preset={activePreset}
        activeIndex={activeIndex}
      />
    </group>
  );
}

function NebulaCloud({
  section,
  preset,
}: {
  section: Section;
  preset: SectionVisualPreset;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<SpriteMaterial>(null);
  const veilRef = useRef<SpriteMaterial>(null);
  const dustRef = useRef<SpriteMaterial>(null);
  const target = useMemo(() => new Vector3(), []);
  const coreTexture = useMemo(
    () => getNebulaTexture(preset, section.id.length * 31),
    [preset, section.id],
  );
  const veilTexture = useMemo(
    () => getNebulaTexture(preset, section.id.length * 47 + 9),
    [preset, section.id],
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (!groupRef.current) return;

    target.fromArray(section.node);
    groupRef.current.position.lerp(target, 0.055);
    groupRef.current.rotation.z =
      Math.sin(time * 0.06) * 0.18 * preset.turbulence;

    if (coreRef.current) {
      coreRef.current.rotation = time * 0.018 * (preset.turbulence + 0.4);
      coreRef.current.opacity =
        preset.cloudOpacity + Math.sin(time * 0.22) * 0.035;
    }
    if (veilRef.current) {
      veilRef.current.rotation = -time * 0.012;
      veilRef.current.opacity = preset.cloudOpacity * 0.64;
    }
    if (dustRef.current) {
      dustRef.current.rotation = time * 0.026;
      dustRef.current.opacity = preset.cloudOpacity * 0.32;
    }

    invalidate();
  });

  return (
    <group ref={groupRef}>
      <sprite position={[0.8, 0.2, -1.8]} scale={preset.cloudScale}>
        <spriteMaterial
          ref={coreRef}
          map={coreTexture}
          color={preset.primary}
          transparent
          opacity={preset.cloudOpacity}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </sprite>
      <sprite
        position={[-1.4, 0.55, -3.4]}
        scale={[
          preset.cloudScale[0] * 1.28,
          preset.cloudScale[1] * 0.74,
          preset.cloudScale[2],
        ]}
      >
        <spriteMaterial
          ref={veilRef}
          map={veilTexture}
          color={preset.secondary}
          transparent
          opacity={preset.cloudOpacity * 0.64}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </sprite>
      <sprite
        position={[2.1, -0.75, -2.2]}
        scale={[
          preset.cloudScale[0] * 0.78,
          preset.cloudScale[1] * 1.05,
          preset.cloudScale[2],
        ]}
      >
        <spriteMaterial
          ref={dustRef}
          map={veilTexture}
          color={preset.tertiary}
          transparent
          opacity={preset.cloudOpacity * 0.32}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

function SectionPath({
  sections,
  points,
  activeIndex,
}: {
  sections: Section[];
  points: [number, number, number][];
  activeIndex: number;
}) {
  return (
    <>
      {points.slice(0, -1).map((start, index) => {
        const fromPreset = getSectionVisualPreset(sections[index].id);
        const toPreset = getSectionVisualPreset(sections[index + 1].id);
        const isNearby = index === activeIndex - 1 || index === activeIndex;

        return (
          <Line
            key={`path-${sections[index].id}`}
            points={[start, points[index + 1]]}
            color={isNearby ? toPreset.tertiary : fromPreset.primary}
            lineWidth={isNearby ? 2.4 : 0.8}
            transparent
            opacity={isNearby ? 0.48 : fromPreset.pathOpacity}
          />
        );
      })}
    </>
  );
}

const nodeFormLabels: Record<SectionVisualPreset["nodeForm"], string> = {
  core: "hero",
  halo: "about",
  cluster: "skills",
  ribbon: "experience",
  stage: "projects",
  chaos: "lab",
  arrival: "contact",
};

function SectionNode({
  section,
  isActive,
  distance,
}: {
  section: Section;
  isActive: boolean;
  distance: number;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const meshRef = useRef<Mesh>(null);
  const preset = getSectionVisualPreset(section.id);
  const baseScale = Math.max(0.42, 1 - distance * 0.12);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const pulse = isActive ? 1 + Math.sin(time * 2.6) * 0.16 : 1;
    meshRef.current.scale.setScalar(baseScale * pulse);
    meshRef.current.rotation.x += 0.002 + preset.turbulence * 0.0015;
    meshRef.current.rotation.y += 0.003 + preset.orbitSpeed * 0.004;

    if (isActive || distance <= 1) invalidate();
  });

  return (
    <group position={section.node} userData={{ form: nodeFormLabels[preset.nodeForm] }}>
      <mesh ref={meshRef}>
        <NodeGeometry form={preset.nodeForm} />
        <meshStandardMaterial
          color={isActive ? preset.tertiary : preset.primary}
          emissive={isActive ? preset.tertiary : preset.primary}
          emissiveIntensity={isActive ? 2.4 : 0.55}
          metalness={0.38}
          roughness={0.24}
          transparent
          opacity={isActive ? 1 : 0.58}
        />
      </mesh>
      {!isActive && (
        <mesh scale={1.7}>
          <sphereGeometry args={[0.18, 18, 18]} />
          <meshBasicMaterial
            color={preset.secondary}
            transparent
            opacity={0.055}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

function NodeGeometry({ form }: { form: SectionVisualPreset["nodeForm"] }) {
  switch (form) {
    case "halo":
      return <torusGeometry args={[0.18, 0.035, 14, 48]} />;
    case "cluster":
      return <dodecahedronGeometry args={[0.22, 0]} />;
    case "ribbon":
      return <torusKnotGeometry args={[0.16, 0.035, 72, 8]} />;
    case "stage":
      return <octahedronGeometry args={[0.24, 1]} />;
    case "chaos":
      return <tetrahedronGeometry args={[0.27, 1]} />;
    case "arrival":
      return <sphereGeometry args={[0.22, 32, 32]} />;
    case "core":
    default:
      return <icosahedronGeometry args={[0.22, 1]} />;
  }
}

function ActiveBeacon({
  section,
  preset,
  activeIndex,
}: {
  section: Section;
  preset: SectionVisualPreset;
  activeIndex: number;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const groupRef = useRef<Group>(null);
  const target = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (!groupRef.current) return;

    target.fromArray(section.node);
    groupRef.current.position.lerp(target, 0.08);
    groupRef.current.rotation.x = time * (0.12 + preset.turbulence * 0.08);
    groupRef.current.rotation.z =
      time * (0.18 + preset.orbitSpeed * 0.5) + activeIndex * 0.3;

    invalidate();
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.78 + preset.turbulence * 0.24, 0.008, 16, 128]} />
        <meshStandardMaterial
          color={preset.tertiary}
          emissive={preset.tertiary}
          emissiveIntensity={1.9}
          transparent
          opacity={0.72}
          metalness={0.82}
          roughness={0.16}
        />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[1.18 + preset.orbitRadius * 0.5, 0.006, 16, 128]} />
        <meshStandardMaterial
          color={preset.primary}
          emissive={preset.primary}
          emissiveIntensity={1.2}
          transparent
          opacity={0.34 + preset.turbulence * 0.12}
          metalness={0.72}
          roughness={0.2}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.52 + preset.turbulence * 0.1, 32, 32]} />
        <meshBasicMaterial
          color={preset.primary}
          transparent
          opacity={0.08 + preset.cloudOpacity * 0.08}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
