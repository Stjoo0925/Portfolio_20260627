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
          "font-display text-display-lg text-balance break-keep font-bold",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {lede && (
        <p className="text-muted text-measure-wide mt-3 text-base leading-relaxed break-keep md:text-lg">
          {lede}
        </p>
      )}
    </header>
  );
}
