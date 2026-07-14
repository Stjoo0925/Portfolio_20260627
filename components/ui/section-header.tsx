import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  lede?: string;
  className?: string;
  titleClassName?: string;
};

export function SectionHeader({
  title,
  lede,
  className,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <header className={cn("section-header", className)}>
      <span className="section-header-rule" data-reveal="line" aria-hidden />
      <h2
        className={cn(
          "section-header-title",
          titleClassName,
        )}
        data-reveal=""
      >
        {title}
      </h2>
      {lede && (
        <p
          className="section-header-lede"
          data-reveal=""
          style={{ "--reveal-delay": "140ms" } as CSSProperties}
        >
          {lede}
        </p>
      )}
    </header>
  );
}
