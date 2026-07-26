"use client";

import { create } from "zustand";

/**
 * Scene phases:
 * - forming:    opening sequence — scattered stars fall into the spiral,
 *               nodes condense, lines draw on (once per session)
 * - exploring:  idle galaxy, free camera drift
 * - converging: electrons rush toward the selected node (pre-flight)
 * - focusing:   camera travels into the node, sphere expands to fill the view
 * - project:    a detail route is open, galaxy dimmed behind the page
 * - returning:  camera flies back to its saved position
 */
export type GalaxyPhase =
  | "forming"
  | "exploring"
  | "converging"
  | "focusing"
  | "project"
  | "returning";

export const CONVERGE_MS = 550;
export const FOCUS_MS = 1000;
export const RETURN_MS = 1300;
export const FORMING_MS = 3200;
/** Abbreviated opening on low-power devices. */
export const FORMING_MS_LOW = 1800;

export function formingDuration(perfLevel: "high" | "low") {
  return perfLevel === "low" ? FORMING_MS_LOW : FORMING_MS;
}

const OPENING_SEEN_KEY = "galaxy-opening-seen";

/** The opening plays once per browser session; storage errors skip it. */
export function hasSeenOpening() {
  try {
    return sessionStorage.getItem(OPENING_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markOpeningSeen() {
  try {
    sessionStorage.setItem(OPENING_SEEN_KEY, "1");
  } catch {
    // best effort — a blocked sessionStorage just skips the replay gate
  }
}

type GalaxyStore = {
  phase: GalaxyPhase;
  /** performance.now() timestamp of the last phase change. */
  phaseStart: number;
  hoveredId: string | null;
  /** Keyboard-focused node (hidden nav buttons). */
  focusedId: string | null;
  /** Node currently opened / being opened. */
  selectedId: string | null;
  reducedMotion: boolean;
  perfLevel: "high" | "low";
  webglAvailable: boolean;
  /** True once the WebGL canvas has been created and can actually render. */
  canvasReady: boolean;
  /** Active opening duration; set when forming is triggered (perf-dependent,
   *  dev-overridable via ?formingMs= for tuning/verification). */
  formingMs: number;
  /** Warp fly-in duration (dev-overridable via ?focusMs=). */
  focusMs: number;
  /** Reverse-warp return duration (dev-overridable via ?returnMs=). */
  returnMs: number;

  setPhase: (phase: GalaxyPhase) => void;
  setHovered: (id: string | null) => void;
  setFocused: (id: string | null) => void;
  setSelected: (id: string | null) => void;
  setReducedMotion: (value: boolean) => void;
  setPerfLevel: (value: "high" | "low") => void;
  setWebglAvailable: (value: boolean) => void;
  setCanvasReady: (value: boolean) => void;
  setFormingMs: (value: number) => void;
  setFocusMs: (value: number) => void;
  setReturnMs: (value: number) => void;
};

export const useGalaxyStore = create<GalaxyStore>((set) => ({
  phase: "exploring",
  phaseStart: 0,
  hoveredId: null,
  focusedId: null,
  selectedId: null,
  reducedMotion: false,
  perfLevel: "high",
  webglAvailable: true,
  canvasReady: false,
  formingMs: FORMING_MS,
  focusMs: FOCUS_MS,
  returnMs: RETURN_MS,

  setPhase: (phase) =>
    set({
      phase,
      phaseStart: typeof performance !== "undefined" ? performance.now() : 0,
    }),
  setHovered: (hoveredId) => set({ hoveredId }),
  setFocused: (focusedId) => set({ focusedId }),
  setSelected: (selectedId) => set({ selectedId }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setPerfLevel: (perfLevel) => set({ perfLevel }),
  setWebglAvailable: (webglAvailable) => set({ webglAvailable }),
  setCanvasReady: (canvasReady) => set({ canvasReady }),
  setFormingMs: (formingMs) => set({ formingMs }),
  setFocusMs: (focusMs) => set({ focusMs }),
  setReturnMs: (returnMs) => set({ returnMs }),
}));

/** Ease-out expo — matches the CSS [0.16, 1, 0.3, 1] feel closely. */
export function easeOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** Symmetric ease for return flights. */
export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Anticipation ease for the warp fly-in: a brief negative dip (a small pull
 * back, like a coiled spring) before the main ease-out push. Consumers that
 * shouldn't go negative (scale, FOV, emissive intensity...) should clamp
 * with `Math.max(0, ...)`, which turns the dip into a held beat instead —
 * the warp used to react instantly and proportionally to elapsed time,
 * which read as an abrupt jump-cut rather than a wound-up launch.
 */
export function easeAnticipate(t: number) {
  const HOLD = 0.12;
  if (t <= 0) return 0;
  if (t < HOLD) return -0.14 * Math.sin((t / HOLD) * Math.PI);
  return easeOutExpo((t - HOLD) / (1 - HOLD));
}

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}
