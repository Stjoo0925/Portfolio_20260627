"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/lib/content/schema";

export function ProjectDetailPanel({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose]);

  return (
    <AnimatePresence mode="wait">
      {project && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            style={{ zIndex: "var(--z-overlay)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            key={project.id}
            className="pointer-events-auto fixed inset-y-0 right-0 flex w-full flex-col overflow-y-auto border-l border-border bg-background-elevated/95 backdrop-blur-md md:w-1/2"
            style={{ zIndex: "calc(var(--z-overlay) + 1)" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            aria-label={`${project.title} 상세`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-8 py-5">
              <span className="text-muted font-mono text-xs uppercase tracking-widest">
                {project.type}
                {project.period.ongoing ? " · 진행중" : ""}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-muted hover:text-foreground rounded-full border border-border px-3 py-1 text-sm transition-colors"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 px-8 py-8">
              <h2 className="font-display text-4xl font-bold md:text-5xl">
                {project.title}
              </h2>

              <p className="text-muted mt-3 font-mono text-xs">
                {project.period.start} — {project.period.end}
                {project.period.duration ? ` (${project.period.duration})` : ""}
                {" · "}
                {project.team.size}명 ({project.team.composition})
              </p>

              <p className="mt-6 text-lg text-foreground/90">
                {project.description}
              </p>

              <div className="mt-8">
                <h3 className="text-gold font-mono text-xs uppercase tracking-widest">
                  주요 역할
                </h3>
                <p className="mt-2 text-foreground/85">{project.role}</p>
              </div>

              <ul className="mt-8 flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-accent/15 bg-accent-soft/60 px-2.5 py-0.5 text-xs text-accent"
                  >
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap gap-4">
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-accent"
                  >
                    <Icon name="Github" size={14} /> GitHub Repository
                  </a>
                )}
                {project.links.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-accent"
                  >
                    <Icon name="ExternalLink" size={14} /> Demo
                  </a>
                )}
                {project.links.detail && (
                  <a
                    href={project.links.detail}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-accent"
                  >
                    <Icon name="ExternalLink" size={14} /> 상세 보기
                  </a>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
