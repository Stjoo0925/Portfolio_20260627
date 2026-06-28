"use client";

import { useEffect } from "react";
import { useDetailPanel } from "@/providers/detail-panel-provider";

export function useDetailPanelLock(active: boolean) {
  const { openPanel, closePanel } = useDetailPanel();

  useEffect(() => {
    if (!active) return;
    openPanel();
    return () => closePanel();
  }, [active, openPanel, closePanel]);
}
