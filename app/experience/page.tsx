import { SectionRouter } from "@/components/sections/section-router";
import { loadSections } from "@/lib/content/load";

export default function ExperiencePage() {
  const section = loadSections().find((item) => item.id === "experience");

  return section ? <SectionRouter section={section} /> : null;
}
