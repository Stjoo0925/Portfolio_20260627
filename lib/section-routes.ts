import type { Section } from "@/lib/content/schema";

export const HOME_SECTION_ID = "hero";

export type SectionAtmosphere = "deep" | "fog" | "clear" | "storm" | "dawn";

export type ParticleShape =
  | "sphere"
  | "wave"
  | "torus"
  | "ribbon"
  | "nebula"
  | "stream"
  | "horizon";

export type FluidParticlePreset = {
  id: string;
  name: string;
  atmosphere: SectionAtmosphere;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  particle: {
    shape: ParticleShape;
    turbulence: number;
    speed: number;
    size: number;
    spread: number;
    curlScale: number;
    glow: number;
  };
  camera: {
    position: [number, number, number];
    lookAt: [number, number, number];
    drift: number;
    driftSpeed: number;
  };
};

const ambientParticle = {
  shape: "sphere" as const,
  turbulence: 0.55,
  speed: 0.04,
  size: 1.2,
  spread: 4.5,
  curlScale: 0.32,
  glow: 0.2,
};

const ambientCamera = {
  position: [0, 0.5, 11] as [number, number, number],
  lookAt: [0, 0, 0] as [number, number, number],
  drift: 0.1,
  driftSpeed: 0.035,
};

const fallbackPreset: FluidParticlePreset = {
  id: HOME_SECTION_ID,
  name: "Hero",
  atmosphere: "deep",
  colors: {
    primary: "#121820",
    secondary: "#0a0e14",
    accent: "#5fd4ff",
    background: "#030508",
  },
  particle: ambientParticle,
  camera: ambientCamera,
};

export const fluidParticlePresets: Record<string, FluidParticlePreset> = {
  hero: fallbackPreset,
  about: {
    id: "about",
    name: "About",
    atmosphere: "fog",
    colors: {
      primary: "#101820",
      secondary: "#0a0e14",
      accent: "#66f2ff",
      background: "#030508",
    },
    particle: { ...ambientParticle, turbulence: 0.5, glow: 0.18 },
    camera: ambientCamera,
  },
  skills: {
    id: "skills",
    name: "Skills",
    atmosphere: "clear",
    colors: {
      primary: "#101420",
      secondary: "#0a0c14",
      accent: "#6e5bff",
      background: "#030508",
    },
    particle: { ...ambientParticle, turbulence: 0.6, glow: 0.22 },
    camera: ambientCamera,
  },
  experience: {
    id: "experience",
    name: "Experience",
    atmosphere: "fog",
    colors: {
      primary: "#101820",
      secondary: "#0a0e14",
      accent: "#ffb75f",
      background: "#030508",
    },
    particle: { ...ambientParticle, turbulence: 0.48, glow: 0.17 },
    camera: ambientCamera,
  },
  projects: {
    id: "projects",
    name: "Projects",
    atmosphere: "clear",
    colors: {
      primary: "#0e141c",
      secondary: "#080c12",
      accent: "#8eeaff",
      background: "#030508",
    },
    particle: { ...ambientParticle, turbulence: 0.58, glow: 0.2 },
    camera: ambientCamera,
  },
  lab: {
    id: "lab",
    name: "Lab",
    atmosphere: "storm",
    colors: {
      primary: "#141018",
      secondary: "#0c0a12",
      accent: "#ff4fd8",
      background: "#030508",
    },
    particle: { ...ambientParticle, turbulence: 0.65, glow: 0.24 },
    camera: ambientCamera,
  },
  contact: {
    id: "contact",
    name: "Contact",
    atmosphere: "dawn",
    colors: {
      primary: "#141210",
      secondary: "#0c0a08",
      accent: "#fff2c6",
      background: "#050408",
    },
    particle: { ...ambientParticle, turbulence: 0.45, glow: 0.16 },
    camera: ambientCamera,
  },
};

export function getFluidParticlePreset(sectionId: string): FluidParticlePreset {
  return fluidParticlePresets[sectionId] ?? fallbackPreset;
}

/** @deprecated Use getFluidParticlePreset */
export function getTerrainZonePreset(sectionId: string) {
  const preset = getFluidParticlePreset(sectionId);
  return {
    id: preset.id,
    name: preset.name,
    atmosphere: preset.atmosphere,
    colors: {
      primary: preset.colors.primary,
      secondary: preset.colors.secondary,
      emissive: preset.colors.accent,
      fog: preset.colors.background,
      sky: preset.colors.background,
    },
    terrain: {
      displacement: 0,
      roughness: 0,
      noiseScale: 0,
      canyonWidth: 0,
      emissiveStrength: 0,
    },
    waypoint: preset.camera.position,
    lookAhead: preset.camera.lookAt,
    uiOffset: [0, 0, 0] as [number, number, number],
  };
}

export function getSectionHref(sectionId: string) {
  return sectionId === HOME_SECTION_ID ? "/" : `/${sectionId}`;
}

export function getSectionIdFromPathname(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/") return HOME_SECTION_ID;

  return normalized.split("/").filter(Boolean)[0] ?? HOME_SECTION_ID;
}

export function getActiveSection(pathname: string, sections: Section[]) {
  const sectionId = getSectionIdFromPathname(pathname);
  return (
    sections.find((section) => section.id === sectionId) ??
    sections.find((section) => section.id === HOME_SECTION_ID) ??
    sections[0]
  );
}

export function getSectionIndex(sectionId: string, sections: Section[]) {
  const index = sections.findIndex((section) => section.id === sectionId);
  return index >= 0 ? index : 0;
}

export function getSectionNeighbors(sectionId: string, sections: Section[]) {
  const index = sections.findIndex((section) => section.id === sectionId);

  return {
    previous: index > 0 ? sections[index - 1] : null,
    next: index >= 0 && index < sections.length - 1 ? sections[index + 1] : null,
  };
}
