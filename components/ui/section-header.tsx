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
    <header className={cn(className)}>
      <h2
        className={cn(
          "section-header-title",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {lede && <p className="section-header-lede">{lede}</p>}
    </header>
  );
}
