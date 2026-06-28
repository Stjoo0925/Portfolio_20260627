"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CanvasWrapper } from "@/components/canvas/canvas-wrapper";
import { Nav } from "@/components/ui/nav";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  getActiveSection,
  getSectionHref,
  getSectionNeighbors,
  getFluidParticlePreset,
} from "@/lib/section-routes";
import { cn } from "@/lib/utils";
import type { Section } from "@/lib/content/schema";

export function PortfolioShell({
  children,
  sections,
}: {
  children: React.ReactNode;
  sections: Section[];
}) {
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();
  const activeSection = getActiveSection(pathname, sections);
  const preset = getFluidParticlePreset(activeSection.id);
  const { previous, next } = getSectionNeighbors(activeSection.id, sections);

  useEffect(() => {
    document.documentElement.style.setProperty("--section-accent", preset.colors.accent);
    document.documentElement.style.setProperty(
      "--section-accent-soft",
      `${preset.colors.accent}29`,
    );
  }, [preset.colors.accent]);

  return (
    <>
      <CanvasWrapper sections={sections} activeSectionId={activeSection.id} />

      {!prefersReducedMotion && (
        <div
          className="pointer-events-none fixed inset-0"
          style={{ zIndex: "calc(var(--z-canvas) + 1)" }}
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_20%_50%,rgba(3,5,8,0.72)_0%,rgba(3,5,8,0.35)_45%,transparent_75%)]" />
        </div>
      )}

      <Nav sections={sections} activeSectionId={activeSection.id} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          className="relative"
          style={{ zIndex: "var(--z-content)" }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {(previous || next) && (
        <div
          className="pointer-events-none fixed right-6 bottom-6 left-6 hidden items-end justify-between gap-4 md:flex"
          style={{ zIndex: "var(--z-header)" }}
        >
          <RouteStepLink direction="previous" section={previous} />
          <RouteStepLink direction="next" section={next} align="end" />
        </div>
      )}
    </>
  );
}

function RouteStepLink({
  direction,
  section,
  align,
}: {
  direction: "previous" | "next";
  section: Section | null;
  align?: "start" | "end";
}) {
  if (!section) {
    return <span className={cn("w-28", align === "end" && "ml-auto")} />;
  }

  return (
    <Link
      href={getSectionHref(section.id)}
      className={cn(
        "pointer-events-auto w-28 rounded-full border border-border bg-background/45 px-4 py-2 font-mono text-[10px] tracking-[0.22em] text-muted uppercase backdrop-blur-md transition-colors hover:border-accent/40 hover:text-accent",
        align === "end" && "ml-auto",
      )}
    >
      {direction === "previous" ? "Prev" : "Next"} / {section.id}
    </Link>
  );
}
