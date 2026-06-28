import type { Section } from "@/lib/content/schema";

export const HOME_SECTION_ID = "hero";

export type SectionAtmosphere = "deep" | "fog" | "clear" | "storm" | "dawn";

export type SectionVisualPreset = {
  id: string;
  name: string;
  narrative: string;
  atmosphere: SectionAtmosphere;
  primary: string;
  secondary: string;
  tertiary: string;
  dust: string;
  starDensity: number;
  cloudScale: [number, number, number];
  cloudOpacity: number;
  turbulence: number;
  cameraOffset: [number, number, number];
  lookOffset: [number, number, number];
  orbitRadius: number;
  orbitSpeed: number;
  verticalDrift: number;
  roll: number;
  pathOpacity: number;
  nodeForm: "core" | "halo" | "cluster" | "ribbon" | "stage" | "chaos" | "arrival";
};

const fallbackVisualPreset: SectionVisualPreset = {
  id: HOME_SECTION_ID,
  name: "Hero",
  narrative: "",
  atmosphere: "deep",
  primary: "#4ec8e8",
  secondary: "#0d2847",
  tertiary: "#7dd3fc",
  dust: "#c8f4ff",
  starDensity: 1,
  cloudScale: [22, 14, 1],
  cloudOpacity: 0.38,
  turbulence: 0.5,
  cameraOffset: [-1.2, 1.7, 5.4],
  lookOffset: [0.4, 0.05, -0.35],
  orbitRadius: 0.26,
  orbitSpeed: 0.16,
  verticalDrift: 0.22,
  roll: 0.015,
  pathOpacity: 0.16,
  nodeForm: "core",
};

export const sectionVisualPresets: Record<string, SectionVisualPreset> = {
  hero: fallbackVisualPreset,
  about: {
    id: "about",
    name: "About",
    narrative: "",
    atmosphere: "fog",
    primary: "#66f2ff",
    secondary: "#2f8f9f",
    tertiary: "#ffd17a",
    dust: "#e5fff8",
    starDensity: 0.86,
    cloudScale: [19, 16, 1],
    cloudOpacity: 0.44,
    turbulence: 0.38,
    cameraOffset: [-1.6, 1.35, 4.9],
    lookOffset: [0.7, 0.1, -0.55],
    orbitRadius: 0.38,
    orbitSpeed: 0.19,
    verticalDrift: 0.16,
    roll: -0.022,
    pathOpacity: 0.2,
    nodeForm: "halo",
  },
  skills: {
    id: "skills",
    name: "Skills",
    narrative: "",
    atmosphere: "clear",
    primary: "#58e5ff",
    secondary: "#6e5bff",
    tertiary: "#f4c25f",
    dust: "#b7c7ff",
    starDensity: 1.14,
    cloudScale: [24, 10, 1],
    cloudOpacity: 0.46,
    turbulence: 0.64,
    cameraOffset: [-2.15, 1.15, 4.35],
    lookOffset: [1.0, -0.05, -0.75],
    orbitRadius: 0.58,
    orbitSpeed: 0.24,
    verticalDrift: 0.12,
    roll: 0.035,
    pathOpacity: 0.26,
    nodeForm: "cluster",
  },
  experience: {
    id: "experience",
    name: "Experience",
    narrative: "",
    atmosphere: "fog",
    primary: "#7bc8ff",
    secondary: "#20406f",
    tertiary: "#ffb75f",
    dust: "#fff1c7",
    starDensity: 0.94,
    cloudScale: [30, 8, 1],
    cloudOpacity: 0.4,
    turbulence: 0.46,
    cameraOffset: [-2.35, 1.65, 4.6],
    lookOffset: [1.2, -0.16, -0.85],
    orbitRadius: 0.46,
    orbitSpeed: 0.15,
    verticalDrift: 0.24,
    roll: -0.045,
    pathOpacity: 0.36,
    nodeForm: "ribbon",
  },
  projects: {
    id: "projects",
    name: "Projects",
    narrative: "",
    atmosphere: "clear",
    primary: "#8eeaff",
    secondary: "#061a33",
    tertiary: "#f6c35f",
    dust: "#d9f7ff",
    starDensity: 0.72,
    cloudScale: [18, 13, 1],
    cloudOpacity: 0.31,
    turbulence: 0.28,
    cameraOffset: [-1.0, 1.45, 5.15],
    lookOffset: [0.45, 0.04, -0.35],
    orbitRadius: 0.2,
    orbitSpeed: 0.13,
    verticalDrift: 0.08,
    roll: 0.01,
    pathOpacity: 0.18,
    nodeForm: "stage",
  },
  lab: {
    id: "lab",
    name: "Lab",
    narrative: "",
    atmosphere: "storm",
    primary: "#ff4fd8",
    secondary: "#6a3dff",
    tertiary: "#4efcff",
    dust: "#ffd6fa",
    starDensity: 1.38,
    cloudScale: [22, 18, 1],
    cloudOpacity: 0.54,
    turbulence: 0.9,
    cameraOffset: [-1.8, 1.8, 4.3],
    lookOffset: [0.95, -0.22, -0.8],
    orbitRadius: 0.74,
    orbitSpeed: 0.34,
    verticalDrift: 0.36,
    roll: 0.07,
    pathOpacity: 0.3,
    nodeForm: "chaos",
  },
  contact: {
    id: "contact",
    name: "Contact",
    narrative: "",
    atmosphere: "dawn",
    primary: "#fff2c6",
    secondary: "#6fdfff",
    tertiary: "#ffffff",
    dust: "#fff9e6",
    starDensity: 0.82,
    cloudScale: [28, 20, 1],
    cloudOpacity: 0.42,
    turbulence: 0.34,
    cameraOffset: [-0.4, 2.25, 6.5],
    lookOffset: [0.12, 0.18, -0.7],
    orbitRadius: 0.34,
    orbitSpeed: 0.11,
    verticalDrift: 0.18,
    roll: -0.018,
    pathOpacity: 0.22,
    nodeForm: "arrival",
  },
};

export function getSectionVisualPreset(sectionId: string) {
  return sectionVisualPresets[sectionId] ?? fallbackVisualPreset;
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
