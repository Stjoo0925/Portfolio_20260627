"use client";

import { Icon } from "@/components/ui/icon";
import { DetailPanelShell } from "@/components/ui/detail-panel-shell";
import { RetrospectiveBlock } from "@/components/ui/retrospective-block";
import { TagChip } from "@/components/ui/tag-chip";
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
      <p className="text-measure-wide text-lg leading-relaxed text-foreground/90">
        {project.description}
      </p>

      <div className="mt-8">
        <h3 className="text-gold font-mono text-xs uppercase tracking-widest">
          주요 특징
        </h3>
        <ul className="mt-3 space-y-2">
          {project.highlights.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-sm leading-relaxed text-foreground/85"
            >
              <span className="text-accent mt-0.5 shrink-0">·</span>
              <span className="min-w-0 flex-1">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-8 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li key={tag} className="max-w-full">
            <TagChip>{tag}</TagChip>
          </li>
        ))}
      </ul>

      <RetrospectiveBlock retrospective={project.retrospective ?? {}} />

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
        {project.links.github && (
          <a
            href={project.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-start gap-1.5 text-sm leading-snug text-foreground/80 transition-colors hover:text-accent"
          >
            <Icon name="Github" size={14} className="mt-0.5 shrink-0" />
            <span className="text-readable-en">GitHub Repository</span>
          </a>
        )}
        {project.links.demo && (
          <a
            href={project.links.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-start gap-1.5 text-sm leading-snug text-foreground/80 transition-colors hover:text-accent"
          >
            <Icon name="ExternalLink" size={14} className="mt-0.5 shrink-0" />
            <span className="text-readable-en">Demo</span>
          </a>
        )}
      </div>
    </DetailPanelShell>
  );
}
