"use client";

/* eslint-disable react-hooks/immutability -- assigning scene.environment is
   the three.js API for environment maps; the scene is not React-rendered state */

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { findNodeByPathname, nodeById } from "@/lib/galaxy/nodes";
import { useGalaxyStore } from "@/store/galaxy-store";

const DEFAULT_RIM_COLOR = new THREE.Color("#b9c7da");
const DEFAULT_ACCENT_COLOR = new THREE.Color("#e8e8ee");
const tempTargetColor = new THREE.Color();

/**
 * Neutral studio environment so silver spheres pick up believable chrome
 * reflections, plus dynamic rim/point light color tinting that lerps to
 * the active route's node accent color.
 */
export function GalaxyEnvironment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  const rimLightRef = useRef<THREE.PointLight>(null);
  const accentLightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    return () => {
      scene.environment = null;
      envTexture.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  useFrame((_, delta) => {
    const { phase, selectedId } = useGalaxyStore.getState();
    const node = selectedId
      ? nodeById.get(selectedId)
      : (typeof window !== "undefined" ? findNodeByPathname(window.location.pathname) : null);

    // Keep the accent tint as a hint rather than a full mood change: blend
    // heavily toward the neutral rim/accent so routes don't read as
    // arbitrarily different colored rooms.
    if ((phase === "project" || phase === "focusing") && node) {
      tempTargetColor.set(node.accent).lerp(DEFAULT_RIM_COLOR, 0.7);
    } else {
      tempTargetColor.copy(DEFAULT_RIM_COLOR);
    }

    const lerpSpeed = 1 - Math.exp(-delta * 4);

    if (rimLightRef.current) {
      rimLightRef.current.color.lerp(tempTargetColor, lerpSpeed);
    }
    if (accentLightRef.current) {
      const targetAccent = (phase === "project" || phase === "focusing") && node
        ? tempTargetColor.clone().lerp(DEFAULT_ACCENT_COLOR, 0.4)
        : DEFAULT_ACCENT_COLOR;
      accentLightRef.current.color.lerp(targetAccent, lerpSpeed);
    }
  });

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[6, 9, 5]} intensity={1.1} color="#ffffff" />
      {/* Cold silver rim from behind node field, tinted by route accent */}
      <pointLight ref={rimLightRef} position={[-10, -5, -20]} intensity={220} color="#b9c7da" />
      <pointLight ref={accentLightRef} position={[12, 6, -6]} intensity={90} color="#e8e8ee" />
    </>
  );
}

