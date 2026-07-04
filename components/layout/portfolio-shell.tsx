"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import {
  getActiveSection,
  getSectionHref,
  getSectionIndex,
  getSectionNeighbors,
  getSectionTheme,
} from "@/lib/section-routes";
import { siteConfig } from "@/lib/site";
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
  const activeSection = getActiveSection(pathname, sections);
  const theme = getSectionTheme(activeSection.id);
  const { previous, next } = getSectionNeighbors(activeSection.id, sections);
  const activeIndex = getSectionIndex(activeSection.id, sections);
  const progress =
    sections.length <= 1 ? 100 : (activeIndex / (sections.length - 1)) * 100;

  useEffect(() => {
    document.documentElement.style.setProperty("--section-accent", theme.accent);
    document.documentElement.style.setProperty(
      "--section-accent-soft",
      `${theme.accent}29`,
    );
  }, [theme.accent]);

  return (
    <>
      <main className="relative" style={{ zIndex: "var(--z-content)" }}>
        {children}
      </main>

      <nav
        aria-label="Portfolio navigation"
        className="pointer-events-none fixed right-3 bottom-3 left-3 md:right-6 md:bottom-6 md:left-6"
        style={{ zIndex: "var(--z-header)" }}
      >
        <div className="mx-auto grid max-w-5xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border border-border bg-background/90 p-2 shadow-[0_20px_70px_rgba(0,0,0,0.42)] backdrop-blur-xl md:gap-3 md:p-3">
          <Link
            href="/"
            className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-background-elevated font-display text-base font-bold tracking-tight text-foreground transition-colors hover:border-accent/50 hover:text-accent focus-visible:border-accent focus-visible:outline-none md:h-12 md:w-12"
            style={{ borderRadius: 8 }}
            aria-label="Home"
          >
            {siteConfig.initials}
          </Link>

          <div className="min-w-0">
            <div className="pointer-events-auto flex items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {sections.map((section, index) => (
                <SectionDockLink
                  key={section.id}
                  section={section}
                  index={index}
                  active={section.id === activeSection.id}
                />
              ))}
            </div>
            <div className="mx-2 mt-2 hidden h-px overflow-hidden bg-border md:block">
              <div
                className="h-full bg-accent transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <RouteStepLink direction="previous" section={previous} />
            <RouteStepLink direction="next" section={next} />
          </div>
        </div>
      </nav>
    </>
  );
}

function SectionDockLink({
  section,
  index,
  active,
}: {
  section: Section;
  index: number;
  active: boolean;
}) {
  const theme = getSectionTheme(section.id);

  return (
    <Link
      href={getSectionHref(section.id)}
      className={cn(
        "group flex h-10 shrink-0 items-center gap-2 border px-3 font-mono text-[10px] tracking-[0.16em] uppercase transition-colors focus-visible:border-accent focus-visible:outline-none md:h-11 md:px-4",
        active
          ? "border-border bg-white/[0.045] text-foreground"
          : "border-transparent text-muted hover:border-border hover:bg-white/[0.025] hover:text-foreground",
      )}
      style={{ borderRadius: 8 }}
      aria-current={active ? "page" : undefined}
    >
      <span
        className="text-[9px]"
        style={active ? { color: theme.accent } : undefined}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="max-w-24 truncate">{section.id}</span>
    </Link>
  );
}

function RouteStepLink({
  direction,
  section,
}: {
  direction: "previous" | "next";
  section: Section | null;
}) {
  const isNext = direction === "next";

  if (!section) {
    return (
      <span
        className="hidden h-11 w-11 shrink-0 border border-transparent md:block"
        aria-hidden
      />
    );
  }

  return (
    <Link
      href={getSectionHref(section.id)}
      className={cn(
        "pointer-events-auto group flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-background-elevated text-muted transition-colors hover:border-accent/45 hover:text-foreground focus-visible:border-accent focus-visible:outline-none md:w-auto md:min-w-28 md:gap-2 md:px-3",
      )}
      style={{ borderRadius: 8 }}
      aria-label={`${isNext ? "Go to next section" : "Go to previous section"}: ${section.id}`}
    >
      <Icon name={isNext ? "ArrowRight" : "ArrowLeft"} size={16} />
      <span className="hidden min-w-0 font-mono text-[10px] tracking-[0.16em] uppercase md:block">
        {isNext ? "Next" : "Prev"}
      </span>
    </Link>
  );
}
