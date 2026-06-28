import { SectionRouter } from "@/components/sections/section-router";
import { loadSections } from "@/lib/content/load";

export default function LabPage() {
  const section = loadSections().find((item) => item.id === "lab");

  return section ? <SectionRouter section={section} /> : null;
}
