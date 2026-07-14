"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGalaxyStore } from "@/store/galaxy-store";

type SupportInstance = {
  position: THREE.Vector3;
  scale: number;
  floatPhase: number;
  floatAmp: number;
};

function makeRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Medium silver spheres — atmosphere between the star dust and main nodes. */
export function SupportingNodes() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const perfLevel = useGalaxyStore((state) => state.perfLevel);
  const count = perfLevel === "low" ? 24 : 46;

  const instances = useMemo<SupportInstance[]>(() => {
    const random = makeRandom(4242);
    return Array.from({ length: count }, () => {
      const r = 4 + Math.pow(random(), 0.8) * 24;
      const angle = random() * Math.PI * 2;
      return {
        position: new THREE.Vector3(
          Math.cos(angle) * r,
          (random() - 0.5) * 13,
          Math.sin(angle) * r - 10,
        ),
        scale: 0.09 + random() * 0.2,
        floatPhase: random() * Math.PI * 2,
        floatAmp: 0.25 + random() * 0.45,
      };
    });
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (useGalaxyStore.getState().phase === "project") return;

    const t = state.clock.elapsedTime;
    instances.forEach((instance, i) => {
      dummy.position.copy(instance.position);
      dummy.position.y += Math.sin(t * 0.24 + instance.floatPhase) * instance.floatAmp;
      dummy.position.x += Math.cos(t * 0.18 + instance.floatPhase * 1.7) * instance.floatAmp * 0.4;
      dummy.scale.setScalar(instance.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 20, 20]} />
      <meshStandardMaterial
        color="#a9a9b0"
        metalness={1}
        roughness={0.38}
        envMapIntensity={0.85}
      />
    </instancedMesh>
  );
}
