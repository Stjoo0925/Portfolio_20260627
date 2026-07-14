"use client";

/* eslint-disable react-hooks/immutability -- assigning scene.environment is
   the three.js API for environment maps; the scene is not React-rendered state */

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Neutral studio environment so silver spheres pick up believable chrome
 * reflections without fetching remote HDRIs, plus a restrained key/rim setup.
 */
export function GalaxyEnvironment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

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

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[6, 9, 5]} intensity={1.1} color="#ffffff" />
      {/* Cold blue-tinted silver rim from behind the node field */}
      <pointLight position={[-10, -5, -20]} intensity={220} color="#b9c7da" />
      <pointLight position={[12, 6, -6]} intensity={90} color="#e8e8ee" />
    </>
  );
}
