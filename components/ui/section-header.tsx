import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  label: string;
  title: string;
  lede?: string;
  className?: string;
  titleClassName?: string;
};

export function SectionHeader({
  label,
  title,
  lede,
  className,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <header
      className={cn("section-header", className)}
      data-has-lede={lede ? "true" : undefined}
    >
      <span className="section-header-rule" data-reveal="line" aria-hidden />
      <div className="section-header-heading">
        <p className="section-header-label" data-reveal="">
          {label}
        </p>
        <h1
          className={cn("section-header-title", titleClassName)}
          data-reveal=""
          style={{ "--reveal-delay": "80ms" } as CSSProperties}
        >
          {title}
        </h1>
      </div>
      {lede ? (
        <div
          className="section-header-summary"
          data-reveal=""
          style={{ "--reveal-delay": "160ms" } as CSSProperties}
        >
          <span>SUMMARY</span>
          <p className="section-header-lede">{lede}</p>
        </div>
      ) : null}
    </header>
  );
}
