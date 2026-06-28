import { SectionRouter } from "@/components/sections/section-router";
import { loadSections } from "@/lib/content/load";

export default function ContactPage() {
  const section = loadSections().find((item) => item.id === "contact");

  return section ? <SectionRouter section={section} /> : null;
}
