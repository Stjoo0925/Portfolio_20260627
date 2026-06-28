import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ElevatedCardProps = {
  children: ReactNode;
  className?: string;
  selected?: boolean;
  as?: "div" | "button";
  onClick?: () => void;
  type?: "button";
};

export function ElevatedCard({
  children,
  className,
  selected = false,
  as = "div",
  onClick,
  type,
}: ElevatedCardProps) {
  const classes = cn(
    "rounded-2xl border bg-background-elevated/60 backdrop-blur-sm transition-[border-color,box-shadow]",
    selected
      ? "border-accent/60 accent-glow"
      : "border-border hover:border-accent/40",
    as === "button" && "group w-full text-left",
    className,
  );

  if (as === "button") {
    return (
      <button type={type ?? "button"} onClick={onClick} className={classes}>
        {children}
      </button>
    );
  }

  return <div className={classes}>{children}</div>;
}
