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
      <dl className="detail-meta-list">
        <div>
          <dt className="sr-only">기간</dt>
          <dd>
            {project.period.start} — {project.period.end}
            {project.period.duration ? ` (${project.period.duration})` : ""}
          </dd>
        </div>
        <div>
          <dt className="sr-only">팀</dt>
          <dd>
            {project.team.size}명 · {project.team.composition}
          </dd>
        </div>
      </dl>

      <p className="detail-description">
        {project.description}
      </p>

      <div className="detail-section">
        <h3 className="detail-heading">
          주요 역할
        </h3>
        <p className="detail-copy">
          {project.role}
        </p>
      </div>

      <ul className="detail-tag-list">
        {project.tags.map((tag) => (
          <li key={tag} className="max-w-full">
            <TagChip>{tag}</TagChip>
          </li>
        ))}
      </ul>

      <RetrospectiveBlock retrospective={project.retrospective ?? {}} />

      <div className="detail-link-list">
        {project.links.github && (
          <a
            href={project.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-link"
          >
            <Icon name="Github" size={14} className="detail-link__icon" />
            <span className="text-readable-en">GitHub Repository</span>
          </a>
        )}
        {project.links.demo && (
          <a
            href={project.links.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-link"
          >
            <Icon name="ExternalLink" size={14} className="detail-link__icon" />
            <span className="text-readable-en">Demo</span>
          </a>
        )}
        {project.links.detail && (
          <a
            href={project.links.detail}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-link"
          >
            <Icon name="ExternalLink" size={14} className="detail-link__icon" />
            <span className="text-readable-en">상세 보기</span>
          </a>
        )}
      </div>
    </DetailPanelShell>
  );
}
