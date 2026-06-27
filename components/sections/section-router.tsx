import { HeroSection } from "./hero-section";
import { AboutSection } from "./about-section";
import { SkillsSection } from "./skills-section";
import { ExperienceSection } from "./experience-section";
import { ProjectsSection } from "./projects-section";
import { ContactSection } from "./contact-section";
import type { Section } from "@/lib/content/schema";

export function SectionRouter({ section }: { section: Section }) {
  switch (section.kind) {
    case "hero":
      return <HeroSection />;
    case "about":
      return <AboutSection />;
    case "skills":
      return <SkillsSection />;
    case "experience":
      return <ExperienceSection />;
    case "projects":
      return <ProjectsSection />;
    case "contact":
      return <ContactSection />;
    default:
      return null;
  }
}
