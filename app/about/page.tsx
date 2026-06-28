import { SectionRouter } from "@/components/sections/section-router";
import { loadSections } from "@/lib/content/load";

export default function AboutPage() {
  const section = loadSections().find((item) => item.id === "about");

  return section ? <SectionRouter section={section} /> : null;
}
