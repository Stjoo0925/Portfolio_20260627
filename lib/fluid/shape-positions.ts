import type { ParticleShape } from "@/lib/section-routes";

function hash(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function generateShapePositions(
  count: number,
  shape: ParticleShape,
  spread: number,
): Float32Array {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const r1 = hash(i);
    const r2 = hash(i + 1000);
    const r3 = hash(i + 2000);
    const t = i / count;

    let x = 0;
    let y = 0;
    let z = 0;

    switch (shape) {
      case "sphere": {
        const theta = r1 * Math.PI * 2;
        const phi = Math.acos(2 * r2 - 1);
        const radius = spread * (0.55 + r3 * 0.45);
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi);
        break;
      }
      case "wave": {
        x = (r1 - 0.5) * spread * 2.4;
        z = (r2 - 0.5) * spread * 1.6;
        y = Math.sin(x * 0.22 + z * 0.18) * spread * 0.35 + (r3 - 0.5) * spread * 0.2;
        break;
      }
      case "torus": {
        const u = r1 * Math.PI * 2;
        const v = r2 * Math.PI * 2;
        const R = spread * 0.75;
        const r = spread * 0.28;
        x = (R + r * Math.cos(v)) * Math.cos(u);
        y = r * Math.sin(v) * 0.8;
        z = (R + r * Math.cos(v)) * Math.sin(u);
        break;
      }
      case "ribbon": {
        x = (t - 0.5) * spread * 3.2;
        y = Math.sin(t * Math.PI * 6) * spread * 0.25 + (r2 - 0.5) * spread * 0.15;
        z = (r3 - 0.5) * spread * 0.35;
        break;
      }
      case "nebula": {
        const angle = t * Math.PI * 14 + r1 * 2;
        const radius = spread * (0.2 + r2 * 1.1);
        x = Math.cos(angle) * radius;
        y = (r3 - 0.5) * spread * 0.6;
        z = Math.sin(angle) * radius;
        break;
      }
      case "stream": {
        x = (r1 - 0.5) * spread * 0.8;
        y = (t - 0.5) * spread * 2.8;
        z = Math.sin(t * Math.PI * 8) * spread * 0.45 + (r2 - 0.5) * spread * 0.2;
        break;
      }
      case "horizon": {
        x = (r1 - 0.5) * spread * 3.5;
        y = (r2 - 0.5) * spread * 0.25 - spread * 0.15;
        z = (r3 - 0.5) * spread * 1.2;
        break;
      }
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  return positions;
}
