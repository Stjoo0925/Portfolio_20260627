export type SupportingNodeData = {
  position: [number, number, number];
  scale: number;
  floatPhase: number;
  floatAmp: number;
};

function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

/** Shared deterministic layout for the background nodes and their graph links. */
export function buildSupportingNodes(count: number): SupportingNodeData[] {
  const random = makeRandom(4242);
  return Array.from({ length: count }, () => {
    const radius = 4 + Math.pow(random(), 0.8) * 24;
    const angle = random() * Math.PI * 2;
    return {
      position: [
        Math.cos(angle) * radius,
        (random() - 0.5) * 13,
        Math.sin(angle) * radius - 10,
      ],
      scale: 0.09 + random() * 0.2,
      floatPhase: random() * Math.PI * 2,
      floatAmp: 0.12 + random() * 0.16,
    };
  });
}
