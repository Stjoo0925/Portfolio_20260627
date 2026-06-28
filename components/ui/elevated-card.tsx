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
    "relative overflow-hidden rounded-3xl border transition-all duration-500 ease-out",
    "bg-white/[0.02] backdrop-blur-2xl",
    "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
    selected
      ? "border-accent/30 bg-white/[0.06] shadow-[0_0_40px_-10px_rgba(95,212,255,0.2),inset_0_1px_1px_rgba(255,255,255,0.15)]"
      : "border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04]",
    as === "button" && "group h-full w-full cursor-pointer text-left",
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
