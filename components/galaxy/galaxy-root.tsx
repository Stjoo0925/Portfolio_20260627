"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { findNodeByPathname, nodeById } from "@/lib/galaxy/nodes";
import {
  CONVERGE_MS,
  FOCUS_MS,
  useGalaxyStore,
} from "@/store/galaxy-store";

const GalaxyCanvas = dynamic(() => import("@/components/galaxy/galaxy-canvas"), {
  ssr: false,
});

/**
 * Hosts the persistent WebGL galaxy behind every route and choreographs the
 * node → page transition state machine (converge → focus → route push →
 * dimmed scene, and the reverse on return).
 */
export function GalaxyRoot() {
  const router = useRouter();
  const pathname = usePathname();
  const phase = useGalaxyStore((state) => state.phase);
  const webglAvailable = useGalaxyStore((state) => state.webglAvailable);

  // Device capability + preference detection
  useEffect(() => {
    const store = useGalaxyStore.getState();

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    store.setReducedMotion(media.matches);
    const onMediaChange = (event: MediaQueryListEvent) =>
      useGalaxyStore.getState().setReducedMotion(event.matches);
    media.addEventListener("change", onMediaChange);

    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowPerf =
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 820 ||
      (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
      navigator.hardwareConcurrency <= 4;
    store.setPerfLevel(lowPerf ? "low" : "high");

    const probe = document.createElement("canvas");
    const context =
      probe.getContext("webgl2") ?? probe.getContext("webgl");
    store.setWebglAvailable(Boolean(context));

    return () => media.removeEventListener("change", onMediaChange);
  }, []);

  // Phase timers: converge → focus → push; return → explore
  useEffect(() => {
    const store = useGalaxyStore.getState();

    if (phase === "converging") {
      const node = store.selectedId ? nodeById.get(store.selectedId) : null;
      if (store.reducedMotion) {
        if (node) router.push(node.href);
        return;
      }
      const id = window.setTimeout(
        () => useGalaxyStore.getState().setPhase("focusing"),
        CONVERGE_MS,
      );
      return () => window.clearTimeout(id);
    }

    if (phase === "focusing") {
      const node = store.selectedId ? nodeById.get(store.selectedId) : null;
      const id = window.setTimeout(() => {
        if (node) router.push(node.href);
        else useGalaxyStore.getState().setPhase("exploring");
      }, FOCUS_MS);
      return () => window.clearTimeout(id);
    }

  }, [phase, router]);

  // Route ↔ phase sync (covers browser back/forward and deep links)
  useEffect(() => {
    const store = useGalaxyStore.getState();

    if (pathname === "/") {
      store.setHovered(null);
      store.setFocused(null);
      store.setSelected(null);
      store.setPhase("exploring");
      return;
    }

    // Keep an already-selected node (e.g. narrativa → /projects) so the
    // reverse transition shrinks the sphere the user actually entered.
    const selected = store.selectedId ? nodeById.get(store.selectedId) : null;
    const normalized = pathname.replace(/\/+$/, "") || "/";
    if (!selected || selected.href !== normalized) {
      store.setSelected(findNodeByPathname(pathname)?.id ?? null);
    }
    if (store.phase !== "project") {
      store.setPhase("project");
      store.setHovered(null);
      document.body.style.cursor = "";
    }
  }, [pathname]);

  // Escape returns to the galaxy from any detail page
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && window.location.pathname !== "/") {
        router.push("/");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  if (!webglAvailable) return null;

  return (
    <>
      <div className="galaxy-layer" data-dim={phase === "project" ? "true" : "false"}>
        <GalaxyCanvas />
      </div>
      <div className="galaxy-transition-overlay" data-phase={phase} aria-hidden />
    </>
  );
}
