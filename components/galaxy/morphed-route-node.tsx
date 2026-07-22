"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { findNodeByPathname, nodeById } from "@/lib/galaxy/nodes";
import { useGalaxyStore } from "@/store/galaxy-store";
import { usePathname } from "next/navigation";

/**
 * Live 3D WebGL Morphing Node System:
 * When a route is active (phase === "project"), the active section node morphs into
 * an architectural 3D structure that floats in 3D WebGL space behind the text content
 * and smoothly responds to mouse cursor parallax movement.
 */
export function MorphedRouteNode() {
  const pathname = usePathname();
  const activeNode = findNodeByPathname(pathname);
  const phase = useGalaxyStore((state) => state.phase);
  const selectedId = useGalaxyStore((state) => state.selectedId);
  const node = activeNode ?? (selectedId ? nodeById.get(selectedId) : null);

  const groupRef = useRef<THREE.Group>(null);
  const primaryMeshRef = useRef<THREE.Mesh>(null);
  const secondaryMeshRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const particlesGroupRef = useRef<THREE.Group>(null);

  const mouseLerp = useRef({ x: 0, y: 0 });

  const isVisible = phase === "project" && Boolean(node);
  const accentColor = useMemo(
    () => new THREE.Color(node?.accent ?? "#8FB8D8"),
    [node?.accent],
  );
  const secondaryColor = useMemo(
    () => new THREE.Color(node?.secondaryAccent ?? "#1E5A96"),
    [node?.secondaryAccent],
  );

  // Orbital particles around the 3D structure
  const orbitalParticles = useMemo(() => {
    const pCount = 36;
    const pos = new Float32Array(pCount * 3);
    const radius = 3.5;
    for (let i = 0; i < pCount; i++) {
      const angle = (i / pCount) * Math.PI * 2;
      const r = radius + (Math.sin(i * 3.7) * 0.5);
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.sin(i * 2.5) * 0.8);
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const damp = 1 - Math.exp(-delta * 4);

    // Track mouse pointer (-1 to 1) for 3D tilt
    mouseLerp.current.x += (state.pointer.x - mouseLerp.current.x) * damp;
    mouseLerp.current.y += (state.pointer.y - mouseLerp.current.y) * damp;

    if (isVisible) {
      // Scale up smoothly into view
      const currentScale = group.scale.x;
      const targetScale = 1;
      group.scale.setScalar(currentScale + (targetScale - currentScale) * damp);

      // Smooth 3D parallax tilt & continuous rotation
      const t = state.clock.elapsedTime;
      group.rotation.x = mouseLerp.current.y * -0.35 + Math.sin(t * 0.2) * 0.08;
      group.rotation.y = mouseLerp.current.x * 0.45 + t * 0.15;
      group.rotation.z = Math.cos(t * 0.15) * 0.05;

      // Sub-component individual rotations
      if (primaryMeshRef.current) {
        primaryMeshRef.current.rotation.x = t * 0.2;
        primaryMeshRef.current.rotation.y = t * 0.3;
      }
      if (secondaryMeshRef.current) {
        secondaryMeshRef.current.rotation.x = -t * 0.25;
        secondaryMeshRef.current.rotation.z = t * 0.35;
      }
      if (ring1Ref.current) {
        ring1Ref.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.4) * 0.15;
        ring1Ref.current.rotation.z = t * 0.4;
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.y = Math.PI / 4 + Math.cos(t * 0.3) * 0.2;
        ring2Ref.current.rotation.z = -t * 0.35;
      }
      if (particlesGroupRef.current) {
        particlesGroupRef.current.rotation.y = -t * 0.25;
      }
    } else {
      // Scale down when returning to home galaxy
      group.scale.setScalar(group.scale.x * (1 - damp));
    }
  });

  if (!node) return null;

  return (
    <group
      ref={groupRef}
      position={[0, 0.2, -6]}
      scale={0.001}
      visible={isVisible}
    >
      {/* Dynamic Geometry per Route */}
      {node.id === "projects" && (
        <group>
          {/* 3D Holographic Cube Lattice */}
          <mesh ref={primaryMeshRef}>
            <boxGeometry args={[3.2, 3.2, 3.2]} />
            <meshBasicMaterial
              color={accentColor}
              wireframe
              transparent
              opacity={0.45}
            />
          </mesh>
          <mesh ref={secondaryMeshRef}>
            <boxGeometry args={[2.2, 2.2, 2.2]} />
            <meshStandardMaterial
              color={secondaryColor}
              metalness={0.9}
              roughness={0.1}
              wireframe
              transparent
              opacity={0.35}
            />
          </mesh>
          {/* Inner glowing core */}
          <mesh>
            <octahedronGeometry args={[1.1, 0]} />
            <meshBasicMaterial
              color={accentColor}
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      )}

      {node.id === "skills" && (
        <group>
          {/* 3D Icosahedron & Orbit Rings */}
          <mesh ref={primaryMeshRef}>
            <icosahedronGeometry args={[2.4, 1]} />
            <meshBasicMaterial
              color={accentColor}
              wireframe
              transparent
              opacity={0.45}
            />
          </mesh>
          <mesh ref={ring1Ref}>
            <torusGeometry args={[3.4, 0.02, 16, 96]} />
            <meshBasicMaterial
              color={accentColor}
              transparent
              opacity={0.6}
            />
          </mesh>
          <mesh ref={ring2Ref}>
            <torusGeometry args={[4.1, 0.015, 16, 96]} />
            <meshBasicMaterial
              color={secondaryColor}
              transparent
              opacity={0.4}
            />
          </mesh>
        </group>
      )}

      {node.id === "about" && (
        <group>
          {/* 3D Gyroscope Spherical Core */}
          <mesh ref={primaryMeshRef}>
            <sphereGeometry args={[1.5, 24, 24]} />
            <meshStandardMaterial
              color={accentColor}
              metalness={0.95}
              roughness={0.2}
              wireframe
              transparent
              opacity={0.4}
            />
          </mesh>
          <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[2.6, 0.025, 16, 80]} />
            <meshBasicMaterial
              color={accentColor}
              transparent
              opacity={0.65}
            />
          </mesh>
          <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
            <torusGeometry args={[3.2, 0.02, 16, 80]} />
            <meshBasicMaterial
              color={secondaryColor}
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>
      )}

      {node.id === "experience" && (
        <group>
          {/* 3D Time Spiral Helix / Double Ring Structure */}
          <mesh ref={primaryMeshRef}>
            <torusKnotGeometry args={[2.0, 0.22, 128, 16, 2, 3]} />
            <meshBasicMaterial
              color={accentColor}
              wireframe
              transparent
              opacity={0.4}
            />
          </mesh>
          <mesh ref={ring1Ref}>
            <torusGeometry args={[3.6, 0.02, 16, 80]} />
            <meshBasicMaterial
              color={secondaryColor}
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>
      )}

      {node.id === "lab" && (
        <group>
          {/* 3D Quantum Wave Lattice */}
          <mesh ref={primaryMeshRef}>
            <octahedronGeometry args={[2.8, 2]} />
            <meshBasicMaterial
              color={accentColor}
              wireframe
              transparent
              opacity={0.5}
            />
          </mesh>
          <mesh ref={secondaryMeshRef}>
            <icosahedronGeometry args={[1.8, 1]} />
            <meshBasicMaterial
              color={secondaryColor}
              wireframe
              transparent
              opacity={0.35}
            />
          </mesh>
        </group>
      )}

      {node.id === "contact" && (
        <group>
          {/* 3D Concentric Signal Wave Rings */}
          <mesh ref={ring1Ref}>
            <torusGeometry args={[2.2, 0.03, 16, 80]} />
            <meshBasicMaterial
              color={accentColor}
              transparent
              opacity={0.7}
            />
          </mesh>
          <mesh ref={ring2Ref}>
            <torusGeometry args={[3.2, 0.025, 16, 80]} />
            <meshBasicMaterial
              color={accentColor}
              transparent
              opacity={0.45}
            />
          </mesh>
          <mesh ref={primaryMeshRef}>
            <torusGeometry args={[4.2, 0.015, 16, 80]} />
            <meshBasicMaterial
              color={secondaryColor}
              transparent
              opacity={0.3}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.1, 16, 16]} />
            <meshBasicMaterial
              color={accentColor}
              wireframe
              transparent
              opacity={0.4}
            />
          </mesh>
        </group>
      )}

      {/* Orbiting Particle Cloud */}
      <group ref={particlesGroupRef}>
        <points geometry={orbitalParticles}>
          <pointsMaterial
            color={accentColor}
            size={0.12}
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </group>
  );
}
