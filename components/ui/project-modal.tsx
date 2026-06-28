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
      <dl className="text-muted space-y-1 font-mono text-xs leading-relaxed">
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt className="sr-only">기간</dt>
          <dd>
            {project.period.start} — {project.period.end}
            {project.period.duration ? ` (${project.period.duration})` : ""}
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt className="sr-only">팀</dt>
          <dd className="break-keep">
            {project.team.size}명 · {project.team.composition}
          </dd>
        </div>
      </dl>

      <p className="text-measure-wide mt-6 text-lg leading-relaxed text-foreground/90">
        {project.description}
      </p>

      <div className="mt-8">
        <h3 className="text-gold font-mono text-xs uppercase tracking-widest">
          주요 역할
        </h3>
        <p className="text-measure-wide mt-2 leading-relaxed text-foreground/85">
          {project.role}
        </p>
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
        {project.links.detail && (
          <a
            href={project.links.detail}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-start gap-1.5 text-sm leading-snug text-foreground/80 transition-colors hover:text-accent"
          >
            <Icon name="ExternalLink" size={14} className="mt-0.5 shrink-0" />
            <span className="text-readable-en">상세 보기</span>
          </a>
        )}
      </div>
    </DetailPanelShell>
  );
}
