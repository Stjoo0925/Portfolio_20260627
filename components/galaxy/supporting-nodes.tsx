"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildSupportingNodes } from "@/lib/galaxy/supporting-nodes";
import {
  clamp01,
  easeOutExpo,
  useGalaxyStore,
} from "@/store/galaxy-store";

/** Medium silver spheres — atmosphere between the star dust and main nodes. */
export function SupportingNodes() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const perfLevel = useGalaxyStore((state) => state.perfLevel);
  const count = perfLevel === "low" ? 24 : 46;

  const instances = useMemo(() => buildSupportingNodes(count), [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const { phase, phaseStart, formingMs } = useGalaxyStore.getState();
    if (phase === "project") return;

    // Opening: spheres condense in a staggered wave after the star infall
    let formP = 1;
    if (phase === "forming") {
      formP = clamp01((performance.now() - phaseStart) / formingMs);
    }

    const t = state.clock.elapsedTime;
    instances.forEach((instance, i) => {
      dummy.position.set(...instance.position);
      dummy.position.y += Math.sin(t * 0.24 + instance.floatPhase) * instance.floatAmp;
      dummy.position.x += Math.cos(t * 0.18 + instance.floatPhase * 1.7) * instance.floatAmp * 0.4;
      let scale = instance.scale;
      if (formP < 1) {
        const stagger = instance.floatPhase / (Math.PI * 2);
        scale *= easeOutExpo(clamp01((formP - (0.42 + stagger * 0.34)) / 0.24));
      }
      dummy.scale.setScalar(Math.max(0.0001, scale));
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
