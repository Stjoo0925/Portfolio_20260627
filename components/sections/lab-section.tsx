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
      <ScrollSection id="lab" align="start">
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
                    p.version ? (
                      <span className="text-accent font-mono text-xs">
                        v{p.version}
                      </span>
                    ) : undefined
                  }
                  signal={
                    hasRetrospective(p) ? (
                      <span
                        className="h-2 w-2 rounded-full bg-accent accent-glow"
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
