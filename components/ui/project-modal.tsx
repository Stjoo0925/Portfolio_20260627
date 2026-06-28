"use client";

import { Icon } from "@/components/ui/icon";
import { DetailPanelShell } from "@/components/ui/detail-panel-shell";
import { RetrospectiveBlock } from "@/components/ui/retrospective-block";
import { TagChip } from "@/components/ui/tag-chip";
import type { Project } from "@/lib/content/schema";

export function ProjectDetailPanel({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  if (!project) return null;

  const badge = `${project.type}${project.period.ongoing ? " · 진행중" : ""}`;

  return (
    <DetailPanelShell
      open={Boolean(project)}
      title={project.title}
      badge={badge}
      onClose={onClose}
    >
      <p className="text-muted font-mono text-xs">
        {project.period.start} — {project.period.end}
        {project.period.duration ? ` (${project.period.duration})` : ""}
        {" · "}
        {project.team.size}명 ({project.team.composition})
      </p>

      <p className="mt-6 text-lg text-foreground/90">{project.description}</p>

      <div className="mt-8">
        <h3 className="text-gold font-mono text-xs uppercase tracking-widest">
          주요 역할
        </h3>
        <p className="mt-2 text-foreground/85">{project.role}</p>
      </div>

      <ul className="mt-8 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li key={tag}>
            <TagChip>{tag}</TagChip>
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
    </DetailPanelShell>
  );
}
