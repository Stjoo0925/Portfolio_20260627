"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { Section } from "@/lib/content/schema";

const Experience = dynamic(
  () => import("./experience").then((mod) => mod.Experience),
  { ssr: false },
);

export function CanvasWrapper({ sections }: { sections: Section[] }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: "var(--z-canvas)" }}
    >
      <Suspense fallback={null}>
        <Experience sections={sections} />
      </Suspense>
    </div>
  );
}
