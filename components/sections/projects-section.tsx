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
      <ScrollSection id="projects" align="start">
        <FadeIn className="max-w-4xl">
          <SectionHeader title={data.title} lede={data.intro} />

          <Stagger className="mt-10 grid gap-6 md:grid-cols-2">
            {data.projects.map((p) => (
              <StaggerItem key={p.id}>
                <WorkCard
                  type={p.type}
                  title={p.title}
                  summary={p.summary}
                  tags={p.tags}
                  selected={selected?.id === p.id}
                  onClick={() =>
                    setSelected((prev) => (prev?.id === p.id ? null : p))
                  }
                  badge={
                    p.featured ? (
                      <span className="text-gold font-mono text-[10px] uppercase tracking-widest">
                        Featured
                      </span>
                    ) : undefined
                  }
                  meta={
                    <>
                      {p.period.start} — {p.period.end}
                      {p.period.duration ? ` (${p.period.duration})` : ""}
                    </>
                  }
                  signal={
                    p.period.ongoing ? (
                      <span className="text-accent text-xs">진행중</span>
                    ) : undefined
                  }
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
