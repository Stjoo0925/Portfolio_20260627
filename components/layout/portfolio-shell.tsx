"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HOME_SECTION_ID,
  getActiveSection,
  getSectionHref,
} from "@/lib/section-routes";
import { nodeById } from "@/lib/galaxy/nodes";
import { useGalaxyStore } from "@/store/galaxy-store";
import type { Section } from "@/lib/content/schema";

import { RouteAurora } from "@/components/layout/route-aurora";

export function PortfolioShell({
  children,
  sections,
}: {
  children: React.ReactNode;
  sections: Section[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const activeSection = getActiveSection(pathname, sections);
  const navSections = sections.filter((section) => section.id !== HOME_SECTION_ID);
  const isHome = activeSection.id === HOME_SECTION_ID;

  /**
   * Navbar clicks run the exact same action as clicking the node itself:
   * on the galaxy view they trigger the converge → focus transition; from a
   * detail page they navigate directly (the galaxy stays dimmed behind).
   */
  const handleSectionClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();

    const href = getSectionHref(sectionId);
    if (pathname === href) return;

    const store = useGalaxyStore.getState();
    const node = nodeById.get(sectionId);
    if (
      pathname === "/" &&
      node &&
      store.webglAvailable &&
      !store.reducedMotion &&
      store.phase === "exploring"
    ) {
      store.setSelected(node.id);
      store.setPhase("converging");
      return;
    }
    if (store.phase === "exploring" || store.phase === "project") {
      router.push(href);
    }
  };

  const handleHomeClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (pathname !== "/") router.push("/");
  };

  const setNodeHighlight = (sectionId: string | null) => {
    const store = useGalaxyStore.getState();
    if (store.phase !== "exploring") return;
    store.setFocused(sectionId);
  };

  return (
    <>
      <RouteAurora />
      <header className="portfolio-nav" data-home={isHome ? "true" : "false"}>
        <Link
          href="/"
          className="portfolio-nav__brand"
          onClick={handleHomeClick}
          aria-label={isHome ? "홈" : "홈으로 돌아가기"}
          aria-current={isHome ? "page" : undefined}
        >
          <span className="portfolio-nav__name">
            {isHome ? "" : "← 홈으로"}
          </span>
        </Link>

        <nav aria-label="Portfolio navigation" className="portfolio-nav__links">
          {navSections.map((section) => {
            const active = section.id === activeSection.id;
            return (
              <Link
                key={section.id}
                href={getSectionHref(section.id)}
                className="portfolio-nav__link"
                data-active={active ? "true" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={(event) => handleSectionClick(event, section.id)}
                onMouseEnter={() => setNodeHighlight(section.id)}
                onMouseLeave={() => setNodeHighlight(null)}
                onFocus={() => setNodeHighlight(section.id)}
                onBlur={() => setNodeHighlight(null)}
              >
                {getSectionLabel(section.id)}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="relative" style={{ zIndex: "var(--z-content)" }}>
        {children}
      </main>

      {/* Mobile-only: the nav row's back-link was sharing space with the
          horizontally-scrollable section links on narrow screens (cramped,
          and ate into how many links were visible without scrolling).
          A separate floating button keeps the nav row 100% dedicated to
          section links and gives "home" its own always-reachable target. */}
      {!isHome && (
        <Link
          href="/"
          className="mobile-home-fab"
          onClick={handleHomeClick}
          aria-label="홈으로 돌아가기"
        >
          ←
        </Link>
      )}
    </>
  );
}

function getSectionLabel(sectionId: string) {
  const labels: Record<string, string> = {
    hero: "Home",
    about: "About",
    skills: "Skills",
    experience: "Career",
    projects: "Projects",
    lab: "Lab",
    contact: "Contact",
  };

  return labels[sectionId] ?? sectionId;
}
