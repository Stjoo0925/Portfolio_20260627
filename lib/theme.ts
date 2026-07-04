export const theme = {
  color: {
    background: "var(--color-background-body)",
    backgroundElevated: "var(--color-background-surface)",
    foreground: "var(--color-text-primary)",
    accent: "var(--color-text-cyan)",
    accentGlow: "var(--color-background-cyan)",
    gold: "var(--color-text-yellow)",
    muted: "var(--color-text-secondary)",
  },
  easing: {
    outExpo: [0.16, 1, 0.3, 1] as const,
    float: [0.45, 0, 0.55, 1] as const,
  },
} as const;
