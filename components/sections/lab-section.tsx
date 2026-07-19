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
      <ScrollSection id="lab" align="start" snap={false}>
        <FadeIn className="route-section-frame editorial-page editorial-compact">
          <SectionHeader label="EXPERIMENTS" title={data.title} lede={data.intro} />

          <Stagger className="work-index">
            {data.projects.map((p) => (
              <StaggerItem key={p.id}>
                <WorkCard
                  kindLabel="LAB"
                  type={p.type}
                  title={p.title}
                  summary={p.summary}
                  tags={p.tags}
                  selected={selected?.id === p.id}
                  onClick={() =>
                    setSelected((prev) => (prev?.id === p.id ? null : p))
                  }
                  status={
                    p.version
                      ? `v${p.version}`
                      : hasRetrospective(p)
                        ? "Retrospective"
                        : undefined
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
