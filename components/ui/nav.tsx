"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getActiveSection, getSectionHref } from "@/lib/section-routes";
import { siteConfig } from "@/lib/site";
import type { Section } from "@/lib/content/schema";

export function Nav({ sections }: { sections: Section[] }) {
  const pathname = usePathname();
  const active = getActiveSection(pathname, sections)?.id ?? sections[0]?.id ?? "";

  return (
    <header
      className="fixed inset-x-0 top-0 z-(--z-header) backdrop-blur-md"
      style={{ zIndex: "var(--z-header)" }}
    >
      <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between md:px-12">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight"
          aria-label="Home"
        >
          {siteConfig.initials}
        </Link>
        <ul className="flex w-full gap-4 overflow-x-auto pb-1 md:w-auto md:gap-6 md:overflow-visible md:pb-0">
          {sections
            .filter((section) => section.kind !== "hero")
            .map((section) => (
              <li key={section.id}>
                <Link
                  href={getSectionHref(section.id)}
                  className={`whitespace-nowrap font-mono text-xs uppercase tracking-widest transition-colors ${
                    active === section.id
                      ? "text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {section.id}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </header>
  );
}
