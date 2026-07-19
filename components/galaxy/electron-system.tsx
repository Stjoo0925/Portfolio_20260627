"use client";

/* eslint-disable react-hooks/immutability -- three.js objects are animated
   imperatively inside the R3F frame loop; they are not React-rendered state */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildConnectionCurves } from "@/lib/galaxy/curves";
import { nodeById } from "@/lib/galaxy/nodes";
import { useGalaxyStore } from "@/store/galaxy-store";

const TRAIL = 7;

const VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  varying float vAlpha;

  void main() {
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (170.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT = /* glsl */ `
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.02, d);
    gl_FragColor = vec4(vec3(0.96, 0.97, 1.0), core * vAlpha);
  }
`;

type Electron = {
  curveIndex: number;
  /** 0..1 progress along the curve. */
  t: number;
  speed: number;
  /** Travel direction: true = from→to. */
  forward: boolean;
  /** When set, the electron circles this node instead of travelling. */
  orbitNodeId: string | null;
  orbitAngle: number;
  orbitTilt: number;
};

/**
 * One shared particle system: bright silver heads with short fading trails.
 * Idle traffic wanders between connected nodes; hover redirects nearby
 * electrons; selection makes all traffic converge on the chosen node.
 */
export function ElectronSystem() {
  const perfLevel = useGalaxyStore((state) => state.perfLevel);
  const electronCount = perfLevel === "low" ? 10 : 22;

  const curves = useMemo(() => buildConnectionCurves(), []);

  const electrons = useMemo<Electron[]>(
    () =>
      Array.from({ length: electronCount }, (_, i) => ({
        curveIndex: i % curves.length,
        t: (i * 0.37) % 1,
        speed: 0.06 + ((i * 137) % 100) / 100 * 0.1,
        forward: i % 2 === 0,
        orbitNodeId: null,
        orbitAngle: (i / electronCount) * Math.PI * 2,
        orbitTilt: ((i * 53) % 100) / 100 - 0.5,
      })),
    [electronCount, curves.length],
  );

  // Ring buffer of previous head positions per electron for the trail
  const history = useMemo(
    () =>
      Array.from({ length: electronCount }, () =>
        Array.from({ length: TRAIL }, () => new THREE.Vector3(0, 0, -999)),
      ),
    [electronCount],
  );

  const { geometry, material, positionAttr } = useMemo(() => {
    const total = electronCount * (TRAIL + 1);
    const positions = new Float32Array(total * 3);
    const sizes = new Float32Array(total);
    const alphas = new Float32Array(total);

    for (let e = 0; e < electronCount; e += 1) {
      const base = e * (TRAIL + 1);
      sizes[base] = 1.5;
      alphas[base] = 1;
      for (let k = 0; k < TRAIL; k += 1) {
        const fade = 1 - (k + 1) / (TRAIL + 1);
        sizes[base + 1 + k] = 1.15 * fade;
        alphas[base + 1 + k] = 0.4 * fade * fade;
      }
    }

    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(positions, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", posAttr);
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat, positionAttr: posAttr };
  }, [electronCount]);

  const headPos = useMemo(() => new THREE.Vector3(), []);
  const pointsRef = useRef<THREE.Points>(null);
  const frameCounter = useRef(0);

  useFrame((_, delta) => {
    const { phase, hoveredId, focusedId, selectedId } = useGalaxyStore.getState();
    // Electron traffic only exists once the galaxy has formed
    if (pointsRef.current) pointsRef.current.visible = phase !== "forming";
    if (phase === "project" || phase === "forming") return;

    const targetId = selectedId ?? hoveredId ?? focusedId;
    const converging = phase === "converging" || phase === "focusing";
    const speedFactor = converging ? 3.6 : 1;
    frameCounter.current += 1;

    for (let e = 0; e < electrons.length; e += 1) {
      const electron = electrons[e];

      // Released from orbit when its node is no longer the target
      if (electron.orbitNodeId && electron.orbitNodeId !== targetId) {
        electron.orbitNodeId = null;
        electron.t = electron.forward ? 0 : 1;
      }

      if (electron.orbitNodeId) {
        const node = nodeById.get(electron.orbitNodeId);
        if (node) {
          electron.orbitAngle += delta * (converging ? 4.2 : 1.6);
          const r = node.radius * 2.1;
          headPos.set(
            node.position[0] + Math.cos(electron.orbitAngle) * r,
            node.position[1] +
              Math.sin(electron.orbitAngle) * r * electron.orbitTilt,
            node.position[2] + Math.sin(electron.orbitAngle) * r,
          );
        }
      } else {
        electron.t += delta * electron.speed * speedFactor * (electron.forward ? 1 : -1);

        const arrived = electron.forward ? electron.t >= 1 : electron.t <= 0;
        if (arrived) {
          const arrivalNode = electron.forward
            ? curves[electron.curveIndex].to
            : curves[electron.curveIndex].from;

          if (targetId && arrivalNode === targetId) {
            // Pulse into orbit around the destination node
            electron.orbitNodeId = targetId;
          } else {
            // Prefer a curve that leads toward the target, else wander on
            const outgoing = curves
              .map((c, index) => ({ c, index }))
              .filter(({ c }) => c.from === arrivalNode || c.to === arrivalNode);
            const towardTarget = targetId
              ? outgoing.filter(({ c }) => c.from === targetId || c.to === targetId)
              : [];
            const pool = towardTarget.length > 0 ? towardTarget : outgoing;
            const pick =
              pool.length > 0
                ? pool[(e * 31 + frameCounter.current) % pool.length]
                : { c: curves[0], index: 0 };

            electron.curveIndex = pick.index;
            electron.forward = pick.c.from === arrivalNode;
            electron.t = electron.forward ? 0 : 1;
            electron.speed = 0.06 + ((e * 37 + frameCounter.current) % 100) / 100 * 0.1;
          }
        }

        electron.t = Math.min(1, Math.max(0, electron.t));
        curves[electron.curveIndex].curve.getPoint(electron.t, headPos);
      }

      // Shift trail history and write positions
      const trail = history[e];
      for (let k = TRAIL - 1; k > 0; k -= 1) trail[k].copy(trail[k - 1]);
      trail[0].copy(headPos);

      const base = e * (TRAIL + 1);
      positionAttr.setXYZ(base, headPos.x, headPos.y, headPos.z);
      for (let k = 0; k < TRAIL; k += 1) {
        positionAttr.setXYZ(base + 1 + k, trail[k].x, trail[k].y, trail[k].z);
      }
    }

    positionAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
  );
}
