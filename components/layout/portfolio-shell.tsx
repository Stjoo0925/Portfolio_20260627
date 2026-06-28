"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CanvasWrapper } from "@/components/canvas/canvas-wrapper";
import { Nav } from "@/components/ui/nav";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  getActiveSection,
  getSectionHref,
  getSectionNeighbors,
} from "@/lib/section-routes";
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
  const { previous, next } = getSectionNeighbors(activeSection.id, sections);

  return (
    <>
      <CanvasWrapper sections={sections} activeSectionId={activeSection.id} />
      <Nav sections={sections} />

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

      <div
        className="pointer-events-none fixed right-6 bottom-6 left-6 hidden items-end justify-between gap-4 md:flex"
        style={{ zIndex: "var(--z-header)" }}
      >
        <RouteStepLink direction="previous" section={previous} />
        <div className="rounded-full border border-accent/15 bg-background/45 px-4 py-2 font-mono text-[10px] tracking-[0.28em] text-muted uppercase backdrop-blur-md">
          {activeSection.id}
        </div>
        <RouteStepLink direction="next" section={next} />
      </div>
    </>
  );
}

function RouteStepLink({
  direction,
  section,
}: {
  direction: "previous" | "next";
  section: Section | null;
}) {
  if (!section) return <span className="w-28" />;

  return (
    <Link
      href={getSectionHref(section.id)}
      className="pointer-events-auto w-28 rounded-full border border-accent/15 bg-background/45 px-4 py-2 font-mono text-[10px] tracking-[0.22em] text-muted uppercase backdrop-blur-md transition-colors hover:border-accent/40 hover:text-accent"
    >
      {direction === "previous" ? "Prev" : "Next"} / {section.id}
    </Link>
  );
}
