"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Card3DTilt({
  children,
  className,
  innerClassName,
  accentColor = "#8FB8D8",
  maxTilt = 12,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  accentColor?: string;
  maxTilt?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50, isHovered: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({
      x: rotateX,
      y: rotateY,
      glareX,
      glareY,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50, isHovered: false });
  };

  return (
    <div
      ref={cardRef}
      className={cn("card-3d-tilt-wrapper", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          "--tilt-x": `${tilt.x}deg`,
          "--tilt-y": `${tilt.y}deg`,
          "--glare-x": `${tilt.glareX}%`,
          "--glare-y": `${tilt.glareY}%`,
          "--card-accent": accentColor,
        } as React.CSSProperties
      }
      data-hovered={tilt.isHovered ? "true" : "false"}
    >
      <div className={cn("card-3d-tilt-inner", innerClassName)}>
        {children}
        <div className="card-3d-glare" />
      </div>
    </div>
  );
}
