"use client";

import { useState } from "react";
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
                    p.version ? (
                      <span className="text-accent font-mono text-[11px] uppercase tracking-[0.2em]">
                        v{p.version}
                      </span>
                    ) : undefined
                  }
                  signal={
                    hasRetrospective(p) ? (
                      <span
                        className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_rgba(95,212,255,0.5)]"
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
