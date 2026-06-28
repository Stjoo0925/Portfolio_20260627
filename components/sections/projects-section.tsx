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
import { UNIFORM_BENTO_GRID_CLASS } from "@/lib/ui/bento-grid";
import { cn } from "@/lib/utils";

export function ProjectsSection() {
  const data = loadProjects();
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <>
      <ScrollSection id="projects" align="start">
        <FadeIn className="w-full max-w-6xl">
          <SectionHeader title={data.title} lede={data.intro} />

          <Stagger className={cn(UNIFORM_BENTO_GRID_CLASS, "mt-12")}>
            {data.projects.map((p) => (
              <StaggerItem key={p.id} className="min-h-0">
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
                      <span className="text-gold font-mono text-[11px] uppercase tracking-[0.2em]">
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
