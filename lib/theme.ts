/**
 * Constellation theme — shared between CSS tokens and R3F scene.
 * Keep in sync with app/globals.css values.
 */
export const theme = {
  color: {
    background: "#05070d",
    backgroundElevated: "#0a0e18",
    foreground: "#e8f4ff",
    accent: "#5fd4ff",
    accentGlow: "#5fd4ff",
    gold: "#f4c25f",
    muted: "#6b7a90",
  },
  easing: {
    outExpo: [0.16, 1, 0.3, 1] as const,
    float: [0.45, 0, 0.55, 1] as const,
  },
} as const;
