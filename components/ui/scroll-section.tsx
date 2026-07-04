import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

export function ScrollSection({
  children,
  className,
  height = "100vh",
  id,
  snap = true,
  align = "center",
}: {
  children: React.ReactNode;
  className?: string;
  height?: string;
  id?: string;
  snap?: boolean;
  align?: "center" | "start";
}) {
  const isStart = align === "start";

  return (
    <section
      id={id}
      className={cn(
        "scroll-section",
        isStart ? "scroll-section--start" : "scroll-section--center",
        snap ? "snap-section" : "snap-section-off",
        className,
      )}
      style={{ "--scroll-section-height": height } as CSSProperties}
    >
      {children}
    </section>
  );
}
