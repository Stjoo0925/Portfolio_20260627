"use client";

import Lenis from "lenis";
import Snap from "lenis/dist/lenis-snap.mjs";
import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useDetailPanel } from "@/providers/detail-panel-provider";
import "lenis/dist/lenis.css";

// 0으로 맞춰야 Lenis Snap(섹션 rect.top 기준)과 네비 클릭 이동이 일치.
// 헤더(약 60px) 분리는 ScrollSection의 align="center"(콘텐츠 50vh) 또는
// align="start"의 pt-28/pt-32 패딩이 담당하므로 추가 offset은 이중 보정이 됨.
const HEADER_OFFSET = 0;

type SnapTarget = {
  id: string;
  top: number;
};

type ScrollProgressContextValue = {
  progress: number;
  activeSectionId: string;
  scrollTo: (
    target: string | HTMLElement,
    options?: { offset?: number },
  ) => void;
};

export const ScrollProgressContext = createContext<ScrollProgressContextValue>({
  progress: 0,
  activeSectionId: "",
  scrollTo: () => {},
});

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { isOpen: isDetailPanelOpen } = useDetailPanel();
  const [progress, setProgress] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState("");
  const lenisRef = useRef<Lenis | null>(null);
  const snapRef = useRef<Snap | null>(null);
  const snapTargetsRef = useRef<SnapTarget[]>([]);

  const findClosestSnapTarget = useCallback((scroll: number) => {
    let closest = "";
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const target of snapTargetsRef.current) {
      const distance = Math.abs(scroll - target.top);
      if (distance < closestDistance) {
        closest = target.id;
        closestDistance = distance;
      }
    }

    return closest;
  }, []);

  const updateScrollState = useCallback(
    (scroll: number, limit?: number) => {
      const scrollLimit =
        limit ?? document.documentElement.scrollHeight - window.innerHeight;

      setProgress(scrollLimit > 0 ? scroll / scrollLimit : 0);

      const nextActiveSectionId = findClosestSnapTarget(scroll);
      if (nextActiveSectionId) {
        setActiveSectionId((current) =>
          current === nextActiveSectionId ? current : nextActiveSectionId,
        );
      }
    },
    [findClosestSnapTarget],
  );

  const refreshSnapTargets = useCallback(() => {
    snapTargetsRef.current = Array.from(
      document.querySelectorAll<HTMLElement>(".snap-section[id]"),
    )
      .map((element) => ({
        id: element.id,
        top: Math.ceil(element.getBoundingClientRect().top + window.scrollY),
      }))
      .sort((a, b) => a.top - b.top);

    updateScrollState(window.scrollY);
  }, [updateScrollState]);

  const scrollTo = useCallback(
    (target: string | HTMLElement, options?: { offset?: number }) => {
      const offset = options?.offset ?? HEADER_OFFSET;
      const element =
        typeof target === "string"
          ? document.querySelector<HTMLElement>(target)
          : target;

      if (!element) return;

      if (prefersReducedMotion || !lenisRef.current) {
        const top =
          element.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: "smooth" });
        return;
      }

      const lenis = lenisRef.current;
      const snap = snapRef.current;

      snap?.stop();
      lenis.scrollTo(element, {
        offset,
        duration: 0.9,
        lock: true,
        onComplete: () => {
          snap?.start();
        },
      });
    },
    [prefersReducedMotion],
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      const handleScroll = () => {
        updateScrollState(window.scrollY);
      };

      let resizeFrame = 0;
      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(refreshSnapTargets);
      });
      resizeObserver.observe(document.documentElement);

      const initialFrame = requestAnimationFrame(() => {
        refreshSnapTargets();
        handleScroll();
      });
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        cancelAnimationFrame(initialFrame);
        cancelAnimationFrame(resizeFrame);
        resizeObserver.disconnect();
        window.removeEventListener("scroll", handleScroll);
      };
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      allowNestedScroll: true,
    });

    lenisRef.current = lenis;
    document.documentElement.classList.add("lenis");

    const snap = new Snap(lenis, {
      type: "proximity",
      lerp: 0.1,
      duration: 1.2,
      distanceThreshold: "20%",
    });
    snapRef.current = snap;

    const registerSnapTargets = () => {
      const snapElements = Array.from(
        document.querySelectorAll<HTMLElement>(".snap-section"),
      );
      return snapElements.map((el) => snap.addElement(el));
    };

    const unsubscribers = registerSnapTargets();
    let resizeFrame = 0;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        snap.resize();
        refreshSnapTargets();
      });
    });
    resizeObserver.observe(document.documentElement);
    const initialFrame = requestAnimationFrame(refreshSnapTargets);

    lenis.on("scroll", ({ scroll, limit }) => {
      updateScrollState(scroll, limit);
    });

    let frameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(initialFrame);
      cancelAnimationFrame(resizeFrame);
      resizeObserver.disconnect();
      unsubscribers.forEach((fn) => fn());
      snap.destroy();
      snapRef.current = null;
      document.documentElement.classList.remove("lenis");
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefersReducedMotion, refreshSnapTargets, updateScrollState]);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (isDetailPanelOpen) {
      lenis.stop();
      return;
    }

    lenis.start();
  }, [isDetailPanelOpen]);

  return (
    <ScrollProgressContext.Provider
      value={{ progress, activeSectionId, scrollTo }}
    >
      {children}
    </ScrollProgressContext.Provider>
  );
}
