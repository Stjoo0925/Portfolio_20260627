"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { findNodeByPathname, nodeById } from "@/lib/galaxy/nodes";
import {
  CONVERGE_MS,
  formingDuration,
  hasSeenOpening,
  markOpeningSeen,
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
  const phaseStart = useGalaxyStore((state) => state.phaseStart);
  const webglAvailable = useGalaxyStore((state) => state.webglAvailable);
  const canvasReady = useGalaxyStore((state) => state.canvasReady);
  const selectedId = useGalaxyStore((state) => state.selectedId);
  const selectedAccent = selectedId ? nodeById.get(selectedId)?.accent : undefined;
  const focusMs = useGalaxyStore((state) => state.focusMs);

  // Device capability + preference detection. useLayoutEffect (not
  // useEffect) so webglAvailable/reducedMotion are known before the route
  // ↔ phase sync effect below runs — both must resolve before the first
  // paint, or the store's default phase ("exploring") briefly renders the
  // intro text at full opacity before flipping to "forming" and hiding it,
  // a visible flash-then-hide on every fresh load of the opening.
  useLayoutEffect(() => {
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

    // Dev-only timing overrides for tuning/automated capture:
    // /?focusMs=8000&returnMs=8000 (opening uses ?formingMs=, parsed at trigger)
    if (process.env.NODE_ENV !== "production") {
      const params = new URLSearchParams(window.location.search);
      const focus = Number(params.get("focusMs"));
      if (Number.isFinite(focus) && focus > 0) {
        store.setFocusMs(Math.min(30000, Math.max(300, focus)));
      }
      const ret = Number(params.get("returnMs"));
      if (Number.isFinite(ret) && ret > 0) {
        store.setReturnMs(Math.min(30000, Math.max(300, ret)));
      }
    }

    return () => media.removeEventListener("change", onMediaChange);
  }, []);

  // Phase timers: forming → explore; converge → focus → push; return → explore
  useEffect(() => {
    const store = useGalaxyStore.getState();

    if (phase === "forming") {
      // The opening clock only runs once the canvas can actually render;
      // galaxy-canvas resets phaseStart (re-running this effect) on create.
      if (!canvasReady) return;
      const id = window.setTimeout(() => {
        const current = useGalaxyStore.getState();
        if (current.phase === "forming") current.setPhase("exploring");
      }, store.formingMs);
      return () => window.clearTimeout(id);
    }

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
      }, store.focusMs);
      return () => window.clearTimeout(id);
    }

    if (phase === "returning") {
      const id = window.setTimeout(() => {
        const current = useGalaxyStore.getState();
        if (current.phase !== "returning") return;
        current.setSelected(null);
        current.setPhase("exploring");
      }, store.returnMs);
      return () => window.clearTimeout(id);
    }

    // phaseStart/canvasReady are dependencies so the forming timer arms when
    // the canvas finishes its (possibly slow) WebGL init and resets the clock.
  }, [phase, phaseStart, canvasReady, router]);

  // Route ↔ phase sync (covers browser back/forward and deep links).
  // useLayoutEffect for the same reason as the capability-detection effect
  // above — this is what actually flips phase to "forming", and it must
  // happen before paint to avoid a flash of the (default-visible) intro.
  useLayoutEffect(() => {
    const store = useGalaxyStore.getState();
    // Marks that the client has actually looked at hasSeenOpening() /
    // reducedMotion / webglAvailable and committed a real phase decision —
    // see the store field's doc comment for why GalaxyIntro gates on this
    // instead of trusting the default "exploring" phase directly.
    store.setClientPhaseResolved(true);

    if (pathname === "/") {
      // Don't clobber an opening sequence already in flight (e.g. the
      // duplicated dev-mode effect run right after we set "forming" below).
      if (store.phase === "forming" || store.phase === "returning") return;
      const fromProject = store.phase === "project";
      store.setHovered(null);
      store.setFocused(null);
      if (
        !hasSeenOpening() &&
        !store.reducedMotion &&
        store.webglAvailable
      ) {
        store.setSelected(null);
        markOpeningSeen();
        let ms = formingDuration(store.perfLevel);
        // Dev-only override so the sequence can be slowed for tuning and
        // automated capture: /?formingMs=20000
        if (process.env.NODE_ENV !== "production") {
          const raw = new URLSearchParams(window.location.search).get("formingMs");
          const parsed = raw ? Number(raw) : NaN;
          if (Number.isFinite(parsed)) {
            ms = Math.min(30000, Math.max(500, parsed));
          }
        }
        store.setFormingMs(ms);
        store.setPhase("forming");
      } else if (
        fromProject &&
        !store.reducedMotion &&
        store.webglAvailable
      ) {
        // Reverse warp back out of the section we were in; selectedId stays
        // set until "exploring" so the camera knows which node to leave from
        store.setPhase("returning");
      } else {
        store.setSelected(null);
        store.setPhase("exploring");
      }
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
      <div
        className="galaxy-transition-overlay"
        data-phase={phase}
        style={
          {
            "--flash-accent": selectedAccent ?? "#f4f4f7",
            // Overlay cover + climax flash stay proportional to the warp
            // length (defaults match the previous hardcoded 0.85s/0.9s)
            "--overlay-delay": `${Math.max(0, focusMs - 650)}ms`,
            "--flash-delay": `${Math.max(0, focusMs - 600)}ms`,
          } as React.CSSProperties
        }
        aria-hidden
      />
    </>
  );
}
