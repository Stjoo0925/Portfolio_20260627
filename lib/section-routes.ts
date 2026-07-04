import type { Section } from "@/lib/content/schema";

export const HOME_SECTION_ID = "hero";

export type SectionTheme = {
  accent: string;
};

const fallbackTheme: SectionTheme = {
  accent: "#5fd4ff",
};

export const sectionThemes: Record<string, SectionTheme> = {
  hero: fallbackTheme,
  about: { accent: "#66f2ff" },
  skills: { accent: "#6e5bff" },
  experience: { accent: "#ffb75f" },
  projects: { accent: "#8eeaff" },
  lab: { accent: "#ff4fd8" },
  contact: { accent: "#fff2c6" },
};

export function getSectionTheme(sectionId: string): SectionTheme {
  return sectionThemes[sectionId] ?? fallbackTheme;
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
