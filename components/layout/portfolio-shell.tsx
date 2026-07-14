"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import {
  HOME_SECTION_ID,
  getActiveSection,
  getSectionHref,
  getSectionTheme,
} from "@/lib/section-routes";
import { siteConfig } from "@/lib/site";
import type { Section } from "@/lib/content/schema";

function magnetize(event: React.PointerEvent<HTMLElement>) {
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  const dx = event.clientX - (rect.left + rect.width / 2);
  const dy = event.clientY - (rect.top + rect.height / 2);
  element.style.transform = `translate(${dx * 0.24}px, ${dy * 0.24}px)`;
}

function demagnetize(event: React.PointerEvent<HTMLElement>) {
  event.currentTarget.style.transform = "";
}

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
  const dockSections = sections.filter((section) => section.id !== HOME_SECTION_ID);

  useEffect(() => {
    document.documentElement.style.setProperty("--section-accent", theme.accent);
    document.documentElement.style.setProperty(
      "--section-accent-soft",
      "color-mix(in oklab, var(--section-accent) 22%, transparent)",
    );
  }, [theme.accent]);

  return (
    <>
      <main className="relative" style={{ zIndex: "var(--z-content)" }}>
        {children}
      </main>

      <nav
        aria-label="Portfolio navigation"
        className="portfolio-dock"
      >
        <div className="portfolio-dock__panel">
          <Link
            href="/"
            className="portfolio-dock__home"
            onPointerMove={magnetize}
            onPointerLeave={demagnetize}
            aria-label="Home"
            aria-current={activeSection.id === HOME_SECTION_ID ? "page" : undefined}
            data-active={activeSection.id === HOME_SECTION_ID ? "true" : undefined}
          >
            <span className="portfolio-dock__home-mark">{siteConfig.initials}</span>
          </Link>

          <div className="portfolio-dock__track">
            <div className="portfolio-dock__links">
              {dockSections.map((section) => (
                <SectionDockLink
                  key={section.id}
                  section={section}
                  active={section.id === activeSection.id}
                />
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

function SectionDockLink({
  section,
  active,
}: {
  section: Section;
  active: boolean;
}) {
  const theme = getSectionTheme(section.id);
  const label = getSectionLabel(section.id);

  return (
    <Link
      href={getSectionHref(section.id)}
      className="portfolio-dock__link"
      onPointerMove={magnetize}
      onPointerLeave={demagnetize}
      data-active={active ? "true" : undefined}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      title={label}
      style={{ "--dock-link-accent": theme.accent } as React.CSSProperties}
    >
      <span className="portfolio-dock__link-icon" aria-hidden>
        <Icon name={getSectionIcon(section.id)} size={16} />
      </span>
    </Link>
  );
}

function getSectionLabel(sectionId: string) {
  const labels: Record<string, string> = {
    hero: "Home",
    about: "About",
    skills: "Skills",
    experience: "Career",
    projects: "Work",
    lab: "Lab",
    contact: "Contact",
  };

  return labels[sectionId] ?? sectionId;
}

function getSectionIcon(sectionId: string) {
  const icons: Record<string, string> = {
    hero: "Home",
    about: "UserRound",
    skills: "Wrench",
    experience: "BriefcaseBusiness",
    projects: "FolderKanban",
    lab: "FlaskConical",
    contact: "Send",
  };

  return icons[sectionId] ?? "Home";
}
