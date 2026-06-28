"use client";

import { TagList } from "@/components/ui/tag-list";
import { TagChip } from "@/components/ui/tag-chip";
import { ElevatedCard } from "@/components/ui/elevated-card";
import { cn } from "@/lib/utils";

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
      className="flex h-full flex-col p-6"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-muted font-mono text-xs uppercase">{type}</span>
        <div className="flex items-center gap-2">
          {signal}
          {badge}
        </div>
      </div>

      <h3 className="font-display mt-2 text-balance break-keep text-2xl leading-snug">
        {title}
      </h3>

      {meta && (
        <div className="text-muted mt-1 font-mono text-xs leading-relaxed break-keep">
          {meta}
        </div>
      )}

      <p className="text-muted mt-3 flex-1 text-sm leading-relaxed break-keep">
        {summary}
      </p>

      {footer}

      <TagList
        tags={tags}
        className="mt-4"
        itemClassName=""
        overflowClassName="text-muted px-1 text-xs"
        renderTag={(tag) => <TagChip>{tag}</TagChip>}
      />

      <span
        className={cn(
          "text-accent mt-4 text-sm transition-opacity",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        {selected ? "닫기 ✕" : "상세 보기 →"}
      </span>
    </ElevatedCard>
  );
}
