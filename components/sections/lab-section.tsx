"use client";

import { useState } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { LabDetailPanel } from "@/components/ui/lab-detail-panel";
import { ScrollSection } from "@/components/ui/scroll-section";
import { TagList } from "@/components/ui/tag-list";
import { loadLab } from "@/lib/content/load";
import type { LabProject } from "@/lib/content/schema";
import { cn } from "@/lib/utils";

export function LabSection() {
  const data = loadLab();
  const [selected, setSelected] = useState<LabProject | null>(null);

  return (
    <>
      <ScrollSection id="lab" align="start">
        <FadeIn className="max-w-4xl">
          <p className="text-gold mb-4 font-mono text-xs uppercase tracking-[0.3em]">
            {data.label}
          </p>
          <h2 className="font-display text-4xl font-bold md:text-6xl">
            {data.title}
          </h2>
          <p className="text-muted mt-4 max-w-xl">{data.intro}</p>

          <Stagger className="mt-10 grid gap-6 md:grid-cols-2">
            {data.projects.map((p) => (
              <StaggerItem key={p.id}>
                <button
                  type="button"
                  onClick={() =>
                    setSelected((prev) => (prev?.id === p.id ? null : p))
                  }
                  className={cn(
                    "group flex w-full flex-col rounded-2xl border bg-background-elevated/60 p-6 text-left backdrop-blur-sm transition-[border-color,box-shadow]",
                    selected?.id === p.id
                      ? "border-accent/60 accent-glow"
                      : "border-border hover:border-accent/40",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-muted font-mono text-xs uppercase">
                      {p.type}
                    </span>
                    {p.version && (
                      <span className="text-accent font-mono text-xs">
                        v{p.version}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display mt-2 text-2xl">{p.title}</h3>
                  <p className="text-muted mt-3 flex-1 text-sm">{p.summary}</p>

                  <TagList
                    tags={p.tags}
                    className="mt-4"
                    itemClassName="rounded-full border border-accent/15 bg-accent-soft/60 px-2.5 py-0.5 text-xs text-accent"
                    overflowClassName="text-muted px-1 text-xs"
                  />

                  <span className="text-accent mt-4 text-sm opacity-0 transition-opacity group-hover:opacity-100">
                    {selected?.id === p.id ? "닫기 ✕" : "상세 보기 →"}
                  </span>
                </button>
              </StaggerItem>
            ))}
          </Stagger>
        </FadeIn>
      </ScrollSection>

      <LabDetailPanel project={selected} onClose={() => setSelected(null)} />
    </>
  );
}
