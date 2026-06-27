import siteJson from "@/content/site.json";
import sectionsJson from "@/content/sections.json";
import heroJson from "@/content/hero.json";
import aboutJson from "@/content/about.json";
import skillsJson from "@/content/skills.json";
import experienceJson from "@/content/experience.json";
import projectsJson from "@/content/projects.json";
import contactJson from "@/content/contact.json";
import {
  aboutSchema,
  contactSchema,
  experienceSchema,
  heroSchema,
  projectsSchema,
  sectionsSchema,
  siteSchema,
  skillsSchema,
  type About,
  type Contact,
  type Experience,
  type Hero,
  type Projects,
  type Section,
  type Site,
  type Skills,
} from "./schema";

export function loadSite(): Site {
  return siteSchema.parse(siteJson);
}

export function loadSections(): Section[] {
  return sectionsSchema.parse(sectionsJson).sections;
}

export function loadHero(): Hero {
  return heroSchema.parse(heroJson);
}

export function loadAbout(): About {
  return aboutSchema.parse(aboutJson);
}

export function loadSkills(): Skills {
  return skillsSchema.parse(skillsJson);
}

export function loadExperience(): Experience {
  return experienceSchema.parse(experienceJson);
}

export function loadProjects(): Projects {
  return projectsSchema.parse(projectsJson);
}

export function loadContact(): Contact {
  return contactSchema.parse(contactJson);
}
