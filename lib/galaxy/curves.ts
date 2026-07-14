import * as THREE from "three";
import { galaxyConnections, nodeById } from "@/lib/galaxy/nodes";

export type ConnectionCurve = {
  from: string;
  to: string;
  curve: THREE.QuadraticBezierCurve3;
};

/** Deterministic 0..1 hash so curve bows stay stable across renders. */
function hash01(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** Curved Bézier paths between connected nodes; shared by lines + electrons. */
export function buildConnectionCurves(): ConnectionCurve[] {
  return galaxyConnections.flatMap(({ from, to }) => {
    const a = nodeById.get(from);
    const b = nodeById.get(to);
    if (!a || !b) return [];

    const pa = new THREE.Vector3(...a.position);
    const pb = new THREE.Vector3(...b.position);
    const dir = pb.clone().sub(pa);
    const length = dir.length();
    const up =
      Math.abs(dir.y) > length * 0.9
        ? new THREE.Vector3(1, 0, 0)
        : new THREE.Vector3(0, 1, 0);
    const perp = dir.clone().cross(up).normalize();
    const seed = hash01(from + to);

    const mid = pa
      .clone()
      .add(pb)
      .multiplyScalar(0.5)
      .addScaledVector(perp, length * (0.16 + 0.14 * seed) * (seed > 0.5 ? 1 : -1));
    mid.y += length * 0.1 * (seed - 0.5);

    return [{ from, to, curve: new THREE.QuadraticBezierCurve3(pa, mid, pb) }];
  });
}
