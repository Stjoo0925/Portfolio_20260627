"use client";

import { useEffect, useRef } from "react";

/**
 * Full-viewport pointer chrome: a faint white flashlight glow plus a
 * 1px crosshair that follows the cursor. Writes transforms directly to
 * the DOM inside rAF — no React re-renders.
 */
export function PointerField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const lineVRef = useRef<HTMLDivElement>(null);
  const lineHRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let frame = 0;
    let x = -1000;
    let y = -1000;

    const render = () => {
      frame = 0;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      if (lineVRef.current) {
        lineVRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      if (lineHRef.current) {
        lineHRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
      }
    };

    const handleMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      rootRef.current?.setAttribute("data-active", "true");
      if (!frame) frame = requestAnimationFrame(render);
    };

    const handleLeave = () => {
      rootRef.current?.removeAttribute("data-active");
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="pointer-field" aria-hidden>
      <div ref={lineHRef} className="pointer-field__line-h" />
      <div ref={lineVRef} className="pointer-field__line-v" />
      <div ref={glowRef} className="pointer-field__glow" />
    </div>
  );
}
