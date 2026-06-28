import { cn } from "@/lib/utils";

type TagChipProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "gold";
};

const variantClasses: Record<NonNullable<TagChipProps["variant"]>, string> = {
  default:
    "rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-foreground/70 group-hover:border-accent/20 group-hover:bg-accent/5 group-hover:text-accent/90 transition-colors duration-300",
  muted:
    "rounded-full border border-border bg-background-elevated/80 px-3 py-1 text-sm text-foreground/90",
  gold:
    "rounded-full border border-gold/25 bg-gold-soft px-3 py-1 text-sm text-gold",
};

export function TagChip({
  children,
  className,
  variant = "default",
}: TagChipProps) {
  return (
    <span
      className={cn(
        "inline-block max-w-full break-keep",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
