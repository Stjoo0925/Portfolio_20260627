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
      <p className="detail-description">
        {project.description}
      </p>

      <div className="detail-section">
        <h3 className="detail-heading">
          주요 특징
        </h3>
        <ul className="detail-bullet-list">
          {project.highlights.map((item) => (
            <li
              key={item}
            >
              <span>·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
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
      </div>
    </DetailPanelShell>
  );
}
