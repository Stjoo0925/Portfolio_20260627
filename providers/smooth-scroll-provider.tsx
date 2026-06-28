"use client";

import Lenis from "lenis";
import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useDetailPanel } from "@/providers/detail-panel-provider";
import "lenis/dist/lenis.css";

/** Route-based pages: Lenis smooth wheel only (no cross-section snap). */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { isOpen: isDetailPanelOpen } = useDetailPanel();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      allowNestedScroll: true,
    });

    lenisRef.current = lenis;
    document.documentElement.classList.add("lenis");

    let frameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      document.documentElement.classList.remove("lenis");
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (isDetailPanelOpen) {
      lenis.stop();
      return;
    }

    lenis.start();
  }, [isDetailPanelOpen]);

  return children;
}
