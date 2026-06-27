"use client";

import Lenis from "lenis";
import Snap from "lenis/dist/lenis-snap.mjs";
import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import "lenis/dist/lenis.css";

type ScrollProgressContextValue = {
  progress: number;
};

export const ScrollProgressContext = createContext<ScrollProgressContextValue>({
  progress: 0,
});

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      const handleScroll = () => {
        const limit =
          document.documentElement.scrollHeight - window.innerHeight;
        setProgress(limit > 0 ? window.scrollY / limit : 0);
      };

      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    document.documentElement.classList.add("lenis");

    const snap = new Snap(lenis, {
      type: "proximity",
      lerp: 0.1,
      duration: 1.2,
      distanceThreshold: "30%",
    });

    const snapElements = Array.from(
      document.querySelectorAll<HTMLElement>(".snap-section"),
    );
    const unsubscribers = snapElements.map((el) => snap.addElement(el));

    lenis.on("scroll", ({ scroll, limit }) => {
      setProgress(limit > 0 ? scroll / limit : 0);
    });

    let frameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      unsubscribers.forEach((fn) => fn());
      snap.destroy();
      document.documentElement.classList.remove("lenis");
      lenis.destroy();
    };
  }, [prefersReducedMotion]);

  return (
    <ScrollProgressContext.Provider value={{ progress }}>
      {children}
    </ScrollProgressContext.Provider>
  );
}
