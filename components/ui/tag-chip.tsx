import { cn } from "@/lib/utils";

type TagChipProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "gold";
};

const variantClasses: Record<NonNullable<TagChipProps["variant"]>, string> = {
  default: "tag-chip tag-chip--default",
  muted: "tag-chip tag-chip--muted",
  gold: "tag-chip tag-chip--gold",
};

export function TagChip({
  children,
  className,
  variant = "default",
}: TagChipProps) {
  return (
    <span
      className={cn(
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
