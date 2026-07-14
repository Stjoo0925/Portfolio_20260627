export type GalaxyNode = {
  id: string;
  label: string;
  /** Route pushed when the node finishes its expansion transition. */
  href: string;
  position: [number, number, number];
  /** Sphere radius in world units. Featured nodes read larger. */
  radius: number;
  featured?: boolean;
};

export type GalaxyConnection = {
  from: string;
  to: string;
};

/**
 * Main interactive nodes. Positions form a loose spiral cluster in front of
 * the default camera (z ≈ +26 looking at origin): dense center, sparse rim.
 */
export const galaxyNodes: GalaxyNode[] = [
  { id: "about", label: "ABOUT ME", href: "/about", position: [-5.6, 2.4, -2], radius: 0.82 },
  { id: "skills", label: "SKILLS", href: "/skills", position: [5.4, 3.4, -6], radius: 0.78 },
  { id: "experience", label: "EXPERIENCE", href: "/experience", position: [-9.8, -1.2, -9], radius: 0.78 },
  { id: "projects", label: "SELECTED PROJECTS", href: "/projects", position: [7.6, -2.2, -1.5], radius: 1.02, featured: true },
  { id: "lab", label: "LAB", href: "/lab", position: [1.4, 5.4, -12], radius: 0.7 },
  { id: "contact", label: "CONTACT", href: "/contact", position: [10.6, 3.6, -15], radius: 0.66 },
  { id: "narrativa", label: "NARRATIVA", href: "/projects", position: [2.8, -5, -8], radius: 0.88, featured: true },
  { id: "leafresh", label: "LEAFRESH", href: "/projects", position: [-3.2, -4.4, -14], radius: 0.74 },
  { id: "afterburner", label: "AFTERBURNER", href: "/projects", position: [-8.4, 4.6, -17], radius: 0.74 },
];

/** Faint curved silver paths; electrons travel along these. */
export const galaxyConnections: GalaxyConnection[] = [
  { from: "about", to: "skills" },
  { from: "skills", to: "experience" },
  { from: "experience", to: "projects" },
  { from: "projects", to: "narrativa" },
  { from: "projects", to: "leafresh" },
  { from: "projects", to: "afterburner" },
  { from: "skills", to: "lab" },
  { from: "lab", to: "projects" },
  { from: "about", to: "contact" },
  { from: "narrativa", to: "leafresh" },
];

export const nodeById = new Map(galaxyNodes.map((node) => [node.id, node]));

/** First matching node for a pathname, e.g. "/skills" → skills node. */
export function findNodeByPathname(pathname: string): GalaxyNode | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/") return null;
  return galaxyNodes.find((node) => node.href === normalized) ?? null;
}

export const GALAXY_NODE_COUNT_LABEL = `${String(galaxyNodes.length).padStart(2, "0")} NODES`;
