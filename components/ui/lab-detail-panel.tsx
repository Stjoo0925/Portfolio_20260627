"use client";

import { Icon } from "@/components/ui/icon";
import { DetailPanelShell } from "@/components/ui/detail-panel-shell";
import { RetrospectiveBlock } from "@/components/ui/retrospective-block";
import type { LabProject } from "@/lib/content/schema";

export function LabDetailPanel({
  project,
  onClose,
}: {
  project: LabProject | null;
  onClose: () => void;
}) {
  if (!project) return null;

  const badge = `${project.type}${project.version ? ` · v${project.version}` : ""}`;

  return (
    <DetailPanelShell
      open={Boolean(project)}
      title={project.title}
      badge={badge}
      onClose={onClose}
    >
      <h2 className="font-display text-4xl font-bold md:text-5xl">
        {project.title}
      </h2>

      <p className="mt-6 text-lg text-foreground/90">{project.description}</p>

      <div className="mt-8">
        <h3 className="text-gold font-mono text-xs uppercase tracking-widest">
          주요 특징
        </h3>
        <ul className="mt-3 space-y-2">
          {project.highlights.map((item) => (
            <li
              key={item}
              className="text-foreground/85 flex gap-2 text-sm leading-relaxed"
            >
              <span className="text-accent">·</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-8 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-accent/15 bg-accent-soft/60 px-2.5 py-0.5 text-xs text-accent"
          >
            {tag}
          </li>
        ))}
      </ul>

      <RetrospectiveBlock retrospective={project.retrospective ?? {}} />

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
      </div>
    </DetailPanelShell>
  );
}
