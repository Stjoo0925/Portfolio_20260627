"use client";

import { usePathname } from "next/navigation";
import { findNodeByPathname } from "@/lib/galaxy/nodes";

/**
 * Route identity wash behind detail-page content: two static blurred blobs
 * tinted with the active node's accent. Deliberately has no per-frame JS —
 * an earlier version drove position via rAF + setState (mouse parallax),
 * which forced a React re-render every frame and was the single most
 * expensive thing running on detail pages. Only the CSS custom properties
 * change (on route change), so the browser only repaints when the accent
 * actually changes.
 */
export function RouteAurora() {
  const pathname = usePathname();
  const node = findNodeByPathname(pathname);
  const isHome = pathname === "/";

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
        } as React.CSSProperties
      }
    >
      <div className="route-aurora__blob route-aurora__blob--primary" />
      <div className="route-aurora__blob route-aurora__blob--secondary" />
    </div>
  );
}
