"use client";

import Link from "next/link";
import { RoleCycle } from "@/components/ui/role-cycle";
import { galaxyNodes } from "@/lib/galaxy/nodes";
import { useGalaxyStore } from "@/store/galaxy-store";
import type { Hero } from "@/lib/content/schema";

/**
 * Minimal landing interface over the node galaxy: identity block lower-left.
 * Keyboard access to the nodes goes through the top navbar (same select
 * action as clicking a node); without WebGL a plain section list appears.
 */
export function GalaxyIntro({ name, hero }: { name: string; hero: Hero }) {
  const phase = useGalaxyStore((state) => state.phase);
  const webglAvailable = useGalaxyStore((state) => state.webglAvailable);

  const visible = phase === "exploring";

  return (
    <div className="galaxy-intro hierarchy-home" data-visible={visible ? "true" : "false"}>
      <p className="galaxy-intro__eyebrow">{hero.greeting}</p>
      <h1 className="galaxy-intro__name">{name.toUpperCase()}</h1>
      <div className="hierarchy-home__meta">
        <div>
          <span className="hierarchy-label">ROLE</span>
          <p className="galaxy-intro__role">
            <RoleCycle roles={hero.roles} />
          </p>
        </div>
        <div>
          <span className="hierarchy-label">FOCUS</span>
          <p className="galaxy-intro__tagline">{hero.tagline}</p>
        </div>
      </div>

      {!webglAvailable && (
        <nav className="galaxy-intro__fallback" aria-label="Portfolio sections">
          {galaxyNodes
            .filter(
              (node, index, all) =>
                all.findIndex((other) => other.href === node.href) === index,
            )
            .map((node) => (
              <Link key={node.id} href={node.href} className="galaxy-intro__fallback-link">
                {node.label}
              </Link>
            ))}
        </nav>
      )}
    </div>
  );
}
