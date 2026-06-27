"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ProjectDetailPanel } from "@/components/ui/project-modal";
import { ScrollSection } from "@/components/ui/scroll-section";
import { loadProjects } from "@/lib/content/load";
import type { Project } from "@/lib/content/schema";
import { cn } from "@/lib/utils";

export function ProjectsSection() {
  const data = loadProjects();
  const [selected, setSelected] = useState<Project | null>(null);

  // 스크롤 시 패널 닫기 (단발성)
  useEffect(() => {
    if (!selected) return;
    const onScroll = () => setSelected(null);
    window.addEventListener("scroll", onScroll, { once: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [selected]);

  return (
    <>
      <ScrollSection id="projects" height="160vh" snap={false}>
        <FadeIn
          className={cn(
            "max-w-4xl transition-[margin] duration-500 ease-out",
            selected ? "md:mr-[50%]" : "",
          )}
        >
          <p className="text-gold mb-4 font-mono text-xs uppercase tracking-[0.3em]">
            {data.label}
          </p>
          <h2 className="font-display text-4xl font-bold md:text-6xl">
            {data.title}
          </h2>
          <p className="text-muted mt-4 max-w-xl">
            개인 및 팀 프로젝트들을 소개합니다. 다양한 기술 스택과 협업
            경험을 통해 성장했습니다.
          </p>

          <Stagger className="mt-10 grid gap-6 md:grid-cols-2">
            {data.projects.map((p) => (
              <StaggerItem key={p.id}>
                <button
                  type="button"
                  onClick={() =>
                    setSelected((prev) => (prev?.id === p.id ? null : p))
                  }
                  className={cn(
                    "group flex w-full flex-col rounded-2xl border bg-background-elevated/60 p-6 text-left backdrop-blur-sm transition-all",
                    selected?.id === p.id
                      ? "border-accent/60 accent-glow"
                      : "border-border hover:border-accent/40",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-muted font-mono text-xs uppercase">
                      {p.type}
                    </span>
                    {p.period.ongoing && (
                      <span className="text-accent text-xs">진행중</span>
                    )}
                  </div>
                  <h3 className="font-display mt-2 text-2xl">{p.title}</h3>
                  <p className="text-muted mt-1 font-mono text-xs">
                    {p.period.start} — {p.period.end}
                    {p.period.duration ? ` (${p.period.duration})` : ""}
                  </p>
                  <p className="text-muted mt-3 flex-1 text-sm">{p.summary}</p>
                  <p className="text-foreground/70 mt-3 line-clamp-2 text-sm">
                    {p.role}
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-2">
                    {p.tags.slice(0, 5).map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-accent/15 bg-accent-soft/60 px-2.5 py-0.5 text-xs text-accent"
                      >
                        {t}
                      </li>
                    ))}
                    {p.tags.length > 5 && (
                      <li className="text-muted px-1 text-xs">
                        +{p.tags.length - 5}
                      </li>
                    )}
                  </ul>

                  <span className="text-accent mt-4 text-sm opacity-0 transition-opacity group-hover:opacity-100">
                    {selected?.id === p.id ? "닫기 ✕" : "상세 보기 →"}
                  </span>
                </button>
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
