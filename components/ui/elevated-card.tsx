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
    "elevated-card",
    selected && "elevated-card--selected",
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
