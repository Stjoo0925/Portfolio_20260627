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
      className="flex h-full min-h-0 flex-col p-5 md:p-6"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className="text-accent/80 shrink-0 font-mono text-[11px] uppercase tracking-[0.2em]">
          {type}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {signal}
          {badge}
        </div>
      </div>

      <h3 className="font-display text-balance break-keep text-xl leading-snug text-foreground transition-colors duration-300 group-hover:text-accent md:text-2xl">
        {title}
      </h3>

      {meta && (
        <div className="text-muted mt-1.5 font-mono text-xs leading-relaxed break-keep">
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

      <div
        className={cn(
          "mt-4 flex items-center text-sm font-medium transition-all duration-300",
          selected
            ? "text-accent opacity-100"
            : "text-muted opacity-70 group-hover:text-foreground group-hover:opacity-100",
        )}
      >
        {selected ? (
          "닫기 ✕"
        ) : (
          <span className="flex items-center gap-1.5">
            상세 보기
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        )}
      </div>
    </ElevatedCard>
  );
}
