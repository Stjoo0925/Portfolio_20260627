"use client";

import { useState } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ProjectDetailPanel } from "@/components/ui/project-modal";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { WorkCard } from "@/components/ui/work-card";
import { loadProjects } from "@/lib/content/load";
import type { Project } from "@/lib/content/schema";

export function ProjectsSection() {
  const data = loadProjects();
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <>
      <ScrollSection id="projects" align="start" snap={false}>
        <FadeIn className="route-section-frame editorial-page editorial-compact">
          <SectionHeader label="SELECTED WORK" title={data.title} lede={data.intro} />

          <Stagger className="work-index">
            {data.projects.map((p) => (
              <StaggerItem key={p.id}>
                <WorkCard
                  kindLabel="PROJECT"
                  type={p.type}
                  title={p.title}
                  summary={p.summary}
                  tags={p.tags}
                  selected={selected?.id === p.id}
                  onClick={() =>
                    setSelected((prev) => (prev?.id === p.id ? null : p))
                  }
                  meta={`${p.period.start} — ${p.period.end}${
                    p.period.duration ? ` (${p.period.duration})` : ""
                  }`}
                  status={p.featured ? "Featured" : p.period.ongoing ? "진행중" : undefined}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </FadeIn>
      </ScrollSection>

      <ProjectDetailPanel
        project={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
