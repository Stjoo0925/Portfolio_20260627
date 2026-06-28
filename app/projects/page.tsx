import { SectionRouter } from "@/components/sections/section-router";
import { loadSections } from "@/lib/content/load";

export default function ProjectsPage() {
  const section = loadSections().find((item) => item.id === "projects");

  return section ? <SectionRouter section={section} /> : null;
}
