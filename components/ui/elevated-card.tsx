"use client";

import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ElevatedCardProps = {
  children: ReactNode;
  className?: string;
  selected?: boolean;
  as?: "div" | "button";
  onClick?: () => void;
  type?: "button";
};

function trackPointer(event: PointerEvent<HTMLElement>) {
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  element.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
  element.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
}

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
      <button
        type={type ?? "button"}
        onClick={onClick}
        onPointerMove={trackPointer}
        className={classes}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={classes} onPointerMove={trackPointer}>
      {children}
    </div>
  );
}
