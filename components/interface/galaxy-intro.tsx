"use client";

import Link from "next/link";
import { RoleCycle } from "@/components/ui/role-cycle";
import {
  GALAXY_NODE_COUNT_LABEL,
  galaxyNodes,
  nodeById,
} from "@/lib/galaxy/nodes";
import { useGalaxyStore } from "@/store/galaxy-store";
import type { Hero } from "@/lib/content/schema";

/**
 * Minimal landing interface over the node galaxy: identity block lower-left,
 * interaction hints, live focused-node readout, and a keyboard-accessible
 * node navigation (visually hidden until focused).
 */
export function GalaxyIntro({ name, hero }: { name: string; hero: Hero }) {
  const phase = useGalaxyStore((state) => state.phase);
  const hoveredId = useGalaxyStore((state) => state.hoveredId);
  const focusedId = useGalaxyStore((state) => state.focusedId);
  const selectedId = useGalaxyStore((state) => state.selectedId);
  const webglAvailable = useGalaxyStore((state) => state.webglAvailable);

  const activeId = selectedId ?? hoveredId ?? focusedId;
  const activeLabel = activeId ? (nodeById.get(activeId)?.label ?? null) : null;
  const visible = phase === "exploring";

  const selectNode = (id: string) => {
    const store = useGalaxyStore.getState();
    if (store.phase !== "exploring") return;
    store.setSelected(id);
    store.setPhase("converging");
  };

  return (
    <>
      <div className="galaxy-intro" data-visible={visible ? "true" : "false"}>
        <p className="galaxy-intro__eyebrow">{hero.greeting}</p>
        <h1 className="galaxy-intro__name">{name.toUpperCase()}</h1>
        <p className="galaxy-intro__role">
          <RoleCycle roles={hero.roles} />
        </p>
        <p className="galaxy-intro__tagline">{hero.tagline}</p>

        {webglAvailable ? (
          <p className="galaxy-intro__hint" aria-hidden>
            DRAG TO EXPLORE
            <br />
            SELECT A NODE TO ENTER
          </p>
        ) : (
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

        <p className="galaxy-intro__status" role="status">
          <span>{activeLabel ?? "DRIFTING"}</span>
          <span aria-hidden> — </span>
          <span>{GALAXY_NODE_COUNT_LABEL}</span>
        </p>
      </div>

      {webglAvailable && (
        <nav className="galaxy-node-nav" aria-label="Galaxy nodes">
          {galaxyNodes.map((node) => (
            <button
              key={node.id}
              type="button"
              className="galaxy-node-nav__button"
              onFocus={() => useGalaxyStore.getState().setFocused(node.id)}
              onBlur={() => {
                if (useGalaxyStore.getState().focusedId === node.id) {
                  useGalaxyStore.getState().setFocused(null);
                }
              }}
              onClick={() => selectNode(node.id)}
            >
              {node.label}
            </button>
          ))}
        </nav>
      )}
    </>
  );
}
