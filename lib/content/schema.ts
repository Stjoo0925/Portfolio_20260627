import { z } from "zod";

export const siteSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: z.string(),
  initials: z.string(),
  url: z.string(),
  links: z.object({
    github: z.string(),
    linkedin: z.string(),
    email: z.string(),
  }),
});

export const sectionKindSchema = z.enum([
  "hero",
  "about",
  "skills",
  "experience",
  "projects",
  "lab",
  "contact",
]);

export const sectionSchema = z.object({
  id: z.string(),
  kind: sectionKindSchema,
  node: z.tuple([z.number(), z.number(), z.number()]),
});

export const sectionsSchema = z.object({
  sections: z.array(sectionSchema),
});

export const ctaSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const heroSchema = z.object({
  greeting: z.string(),
  name: z.string(),
  roles: z.array(z.string()),
  tagline: z.string(),
  cta: z.array(ctaSchema),
});

export const aboutSchema = z.object({
  label: z.string(),
  title: z.string(),
  intro: z.string(),
  paragraphs: z.array(z.string()),
  highlights: z.array(z.string()),
});

export const careerItemSchema = z.object({
  org: z.string(),
  period: z.string(),
  description: z.string(),
});

export const educationItemSchema = z.object({
  school: z.string(),
  major: z.string(),
  period: z.string(),
  gpa: z.string().optional(),
});

export const trainingItemSchema = z.object({
  title: z.string(),
  period: z.string(),
  org: z.string(),
});

export const certificateItemSchema = z.object({
  name: z.string(),
  org: z.string(),
});

export const experienceSchema = z.object({
  label: z.string(),
  title: z.string(),
  career: z.array(careerItemSchema),
  education: z.array(educationItemSchema),
  training: z.array(trainingItemSchema),
  certificates: z.array(certificateItemSchema),
});

export const skillsSchema = z.object({
  label: z.string(),
  title: z.string(),
  categories: z.array(
    z.object({ name: z.string(), items: z.array(z.string()) }),
  ),
});

export const retrospectiveSchema = z.object({
  overview: z.string().optional(),
  learnings: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  nextSteps: z.string().optional(),
});

export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  period: z.object({
    start: z.string(),
    end: z.string(),
    duration: z.string().optional(),
    ongoing: z.boolean().optional(),
  }),
  team: z.object({
    size: z.number(),
    composition: z.string(),
  }),
  summary: z.string(),
  description: z.string(),
  role: z.string(),
  tags: z.array(z.string()),
  thumbnail: z.string().optional(),
  links: z.object({
    github: z.string().optional(),
    demo: z.string().optional(),
    detail: z.string().optional(),
  }),
  featured: z.boolean().optional(),
  retrospective: retrospectiveSchema.optional(),
});

export const projectsSchema = z.object({
  label: z.string(),
  title: z.string(),
  projects: z.array(projectSchema),
});

export const labProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  version: z.string().nullable().optional(),
  summary: z.string(),
  description: z.string(),
  highlights: z.array(z.string()),
  tags: z.array(z.string()),
  links: z.object({
    github: z.string().optional(),
    demo: z.string().optional(),
  }),
  retrospective: retrospectiveSchema.optional(),
});

export const labSchema = z.object({
  label: z.string(),
  title: z.string(),
  intro: z.string(),
  projects: z.array(labProjectSchema),
});

export const contactSchema = z.object({
  label: z.string(),
  title: z.string(),
  body: z.string(),
  email: z.string(),
  location: z.string(),
  channels: z.array(
    z.object({ name: z.string(), href: z.string(), icon: z.string() }),
  ),
});

export type Site = z.infer<typeof siteSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type SectionKind = z.infer<typeof sectionKindSchema>;
export type Hero = z.infer<typeof heroSchema>;
export type About = z.infer<typeof aboutSchema>;
export type Skills = z.infer<typeof skillsSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type CareerItem = z.infer<typeof careerItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type TrainingItem = z.infer<typeof trainingItemSchema>;
export type CertificateItem = z.infer<typeof certificateItemSchema>;
export type Retrospective = z.infer<typeof retrospectiveSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Projects = z.infer<typeof projectsSchema>;
export type LabProject = z.infer<typeof labProjectSchema>;
export type Lab = z.infer<typeof labSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type Cta = z.infer<typeof ctaSchema>;
