"use client";

import { type MouseEvent } from "react";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { loadSections } from "@/lib/content/load";
import { siteConfig } from "@/lib/site";

export function Nav() {
  const sections = loadSections();
  const { activeSectionId, scrollTo } = useScrollProgress();
  const active = activeSectionId || sections[0]?.id || "";

  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    scrollTo(`#${id}`);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-(--z-header) backdrop-blur-md"
      style={{ zIndex: "var(--z-header)" }}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-12">
        <a
          href="#hero"
          onClick={(event) => handleNavigate(event, "hero")}
          className="font-display text-lg font-bold tracking-tight"
        >
          {siteConfig.initials}
        </a>
        <ul className="hidden gap-6 md:flex">
          {sections
            .filter((section) => section.kind !== "hero")
            .map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(event) => handleNavigate(event, section.id)}
                  className={`font-mono text-xs uppercase tracking-widest transition-colors ${
                    active === section.id
                      ? "text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {section.id}
                </a>
              </li>
            ))}
        </ul>
      </nav>
    </header>
  );
}
