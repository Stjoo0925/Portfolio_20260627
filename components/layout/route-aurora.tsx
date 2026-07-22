"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { findNodeByPathname } from "@/lib/galaxy/nodes";
import { useGalaxyStore } from "@/store/galaxy-store";

export function RouteAurora() {
  const pathname = usePathname();
  const node = findNodeByPathname(pathname);
  const isHome = pathname === "/";
  const reducedMotion = useGalaxyStore((state) => state.reducedMotion);

  // Mouse position in -1..1 range for subtle parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const targetMouse = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion || isHome) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      targetMouse.current = { x, y };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let currentX = 0;
    let currentY = 0;

    const loop = () => {
      // Smooth linear interpolation (lerp)
      currentX += (targetMouse.current.x - currentX) * 0.05;
      currentY += (targetMouse.current.y - currentY) * 0.05;
      setMousePos({ x: currentX, y: currentY });
      animFrame.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [reducedMotion, isHome]);

  const primaryAccent = node?.accent ?? "#4FA8ED";
  const secondaryAccent = node?.secondaryAccent ?? "#1E5A96";

  return (
    <div
      className="route-aurora"
      aria-hidden="true"
      data-active={!isHome ? "true" : "false"}
      style={
        {
          "--aurora-primary": primaryAccent,
          "--aurora-secondary": secondaryAccent,
          "--aurora-mouse-x": `${mousePos.x * 60}px`,
          "--aurora-mouse-y": `${mousePos.y * 60}px`,
        } as React.CSSProperties
      }
    >
      <div className="route-aurora__blob route-aurora__blob--primary" />
      <div className="route-aurora__blob route-aurora__blob--secondary" />
      <div className="route-aurora__blob route-aurora__blob--center" />
      <div className="route-aurora__noise" />
    </div>
  );
}
