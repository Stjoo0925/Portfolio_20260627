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
          "font-display text-display-lg font-bold",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {lede && (
        <p className="text-muted mt-4 max-w-xl text-lg leading-relaxed">
          {lede}
        </p>
      )}
    </header>
  );
}
