"use client";

import { TagList } from "@/components/ui/tag-list";
import { TagChip } from "@/components/ui/tag-chip";
import { ElevatedCard } from "@/components/ui/elevated-card";

type WorkCardProps = {
  type: string;
  title: string;
  summary: string;
  tags: string[];
  selected?: boolean;
  onClick?: () => void;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
  footer?: React.ReactNode;
  signal?: React.ReactNode;
};

export function WorkCard({
  type,
  title,
  summary,
  tags,
  selected = false,
  onClick,
  badge,
  meta,
  footer,
  signal,
}: WorkCardProps) {
  return (
    <ElevatedCard
      as="button"
      selected={selected}
      onClick={onClick}
      className="work-card"
    >
      <div className="work-card__header">
        <span className="work-card__type">
          {type}
        </span>
        <div className="work-card__badges">
          {signal}
          {badge}
        </div>
      </div>

      <h3 className="work-card__title">
        {title}
      </h3>

      {meta && (
        <div className="work-card__meta">
          {meta}
        </div>
      )}

      <p className="work-card__summary">
        {summary}
      </p>

      {footer}

      <TagList
        tags={tags}
        className="work-card__tags"
        itemClassName=""
        overflowClassName="tag-list__overflow"
        renderTag={(tag) => <TagChip>{tag}</TagChip>}
      />

      <div className="work-card__action" data-selected={selected ? "true" : undefined}>
        {selected ? (
          "닫기 ✕"
        ) : (
          <span>
            상세 보기
            <span className="work-card__arrow">
              →
            </span>
          </span>
        )}
      </div>
    </ElevatedCard>
  );
}
