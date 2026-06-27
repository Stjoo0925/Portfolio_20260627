"use client";

import { useEffect, useState } from "react";
import { loadSections } from "@/lib/content/load";
import { siteConfig } from "@/lib/site";

export function Nav() {
  const sections = loadSections();
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const handler = () => {
      const center = window.innerHeight / 2;
      let current = sections[0]?.id ?? "";
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= center) current = s.id;
      }
      setActive(current);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [sections]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-(--z-header) backdrop-blur-md"
      style={{ zIndex: "var(--z-header)" }}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-12">
        <a
          href="#hero"
          className="font-display text-lg font-bold tracking-tight"
        >
          {siteConfig.initials}
        </a>
        <ul className="hidden gap-6 md:flex">
          {sections
            .filter((s) => s.kind !== "hero")
            .map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`font-mono text-xs uppercase tracking-widest transition-colors ${
                    active === s.id
                      ? "text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {s.id}
                </a>
              </li>
            ))}
        </ul>
      </nav>
    </header>
  );
}
