import { SectionRouter } from "@/components/sections/section-router";
import { loadSections } from "@/lib/content/load";

export default function SkillsPage() {
  const section = loadSections().find((item) => item.id === "skills");

  return section ? <SectionRouter section={section} /> : null;
}
