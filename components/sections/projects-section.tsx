"use client";

import { useState } from "react";
import { Badge } from "@astryxdesign/core/Badge";
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
        <FadeIn className="route-section-frame">
          <SectionHeader title={data.title} lede={data.intro} />

          <Stagger className={cn(UNIFORM_BENTO_GRID_CLASS, "route-section-grid")}>
            {data.projects.map((p) => (
              <StaggerItem key={p.id} className="route-bento-item">
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
                      <Badge
                        className="portfolio-badge"
                        label="Featured"
                        variant="yellow"
                      />
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
                      <span className="route-status">진행중</span>
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
