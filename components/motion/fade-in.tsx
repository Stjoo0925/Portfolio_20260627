"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  // Opacity + a small y-drift only — no blur here. The section headers this
  // wraps run their own CSS blur/letter-spacing materialize on entry
  // (.section-header-title[data-reveal]); stacking a second blur transition
  // on the container on top of that read as a doubled, blunt fade rather
  // than one arrival.
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
