export type GalaxyNode = {
  id: string;
  label: string;
  /** Route pushed when the node finishes its expansion transition. */
  href: string;
  position: [number, number, number];
  /** Sphere radius in world units. Featured nodes read larger. */
  radius: number;
  /** Muted editorial accent used to identify interactive nodes. */
  accent: string;
  /** Secondary deeper accent for dual-stop aurora gradient mesh */
  secondaryAccent: string;
  featured?: boolean;
};

export type GalaxyConnection = {
  from: string;
  to: string;
};

/**
 * Main interactive nodes — one per navigation section (kept 1:1 with the
 * navbar). Positions form a loose cluster in front of the default camera
 * (z ≈ +26 looking at origin): dense center, sparse rim.
 */
export const galaxyNodes: GalaxyNode[] = [
  { id: "about", label: "ABOUT ME", href: "/about", position: [-6.4, 2.8, -2], radius: 0.86, accent: "#8FB8D8", secondaryAccent: "#142C44" },
  { id: "skills", label: "SKILLS", href: "/skills", position: [5.6, 3.8, -6], radius: 0.8, accent: "#8FBFAE", secondaryAccent: "#12382F" },
  { id: "experience", label: "CAREER", href: "/experience", position: [-9.6, -2, -10], radius: 0.8, accent: "#C7A96B", secondaryAccent: "#3B2B12" },
  { id: "projects", label: "PROJECTS", href: "/projects", position: [7.2, -2.6, -2], radius: 1.05, accent: "#C8897A", secondaryAccent: "#3D1B16", featured: true },
  { id: "lab", label: "LAB", href: "/lab", position: [0.6, 5.4, -12], radius: 0.72, accent: "#A99BCB", secondaryAccent: "#281B42" },
  { id: "contact", label: "CONTACT", href: "/contact", position: [-1.8, -5, -7], radius: 0.72, accent: "#9EB98E", secondaryAccent: "#1F3316" },
];

/** Faint curved silver paths; electrons travel along these. */
export const galaxyConnections: GalaxyConnection[] = [
  { from: "about", to: "skills" },
  { from: "skills", to: "experience" },
  { from: "experience", to: "projects" },
  { from: "projects", to: "lab" },
  { from: "lab", to: "skills" },
  { from: "about", to: "contact" },
  { from: "contact", to: "projects" },
  { from: "experience", to: "contact" },
];

export const nodeById = new Map(galaxyNodes.map((node) => [node.id, node]));

/** First matching node for a pathname, e.g. "/skills" → skills node. */
export function findNodeByPathname(pathname: string): GalaxyNode | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/") return null;
  return galaxyNodes.find((node) => node.href === normalized) ?? null;
}

export const GALAXY_NODE_COUNT_LABEL = `${String(galaxyNodes.length).padStart(2, "0")} NODES`;

