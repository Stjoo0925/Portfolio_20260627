"use client";

import { useState } from "react";
import { Badge } from "@astryxdesign/core/Badge";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { LabDetailPanel } from "@/components/ui/lab-detail-panel";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { WorkCard } from "@/components/ui/work-card";
import { loadLab } from "@/lib/content/load";
import type { LabProject } from "@/lib/content/schema";
import { UNIFORM_BENTO_GRID_CLASS } from "@/lib/ui/bento-grid";
import { cn } from "@/lib/utils";

function hasRetrospective(project: LabProject) {
  const r = project.retrospective;
  if (!r) return false;
  return Boolean(
    r.overview ||
      (r.learnings && r.learnings.length > 0) ||
      (r.challenges && r.challenges.length > 0) ||
      r.nextSteps,
  );
}

export function LabSection() {
  const data = loadLab();
  const [selected, setSelected] = useState<LabProject | null>(null);

  return (
    <>
      <ScrollSection id="lab" align="start">
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
                    p.version ? (
                      <Badge
                        className="portfolio-badge"
                        label={`v${p.version}`}
                        variant="cyan"
                      />
                    ) : undefined
                  }
                  signal={
                    hasRetrospective(p) ? (
                      <span
                        className="lab-signal-dot"
                        title="회고 작성됨"
                        aria-label="회고 작성됨"
                      />
                    ) : undefined
                  }
                />
              </StaggerItem>
            ))}
          </Stagger>
        </FadeIn>
      </ScrollSection>

      <LabDetailPanel project={selected} onClose={() => setSelected(null)} />
    </>
  );
}
