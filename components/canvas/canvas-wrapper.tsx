"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useDetailPanel } from "@/providers/detail-panel-provider";
import type { Section } from "@/lib/content/schema";

const Experience = dynamic(
  () => import("./experience").then((mod) => mod.Experience),
  { ssr: false },
);

export function CanvasWrapper({
  sections,
  activeSectionId,
}: {
  sections: Section[];
  activeSectionId: string;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { isOpen: isDetailPanelOpen } = useDetailPanel();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{
        zIndex: "var(--z-canvas)",
        visibility: isDetailPanelOpen ? "hidden" : "visible",
      }}
    >
      <Suspense fallback={null}>
        <Experience
          sections={sections}
          activeSectionId={activeSectionId}
          frameloop={isDetailPanelOpen ? "never" : "always"}
        />
      </Suspense>
    </div>
  );
}
