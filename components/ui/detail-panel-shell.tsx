"use client";

import { useEffect } from "react";
import { useDetailPanelLock } from "@/hooks/use-detail-panel-lock";
import { cn } from "@/lib/utils";

export function DetailPanelShell({
  open,
  title,
  badge,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  badge: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useDetailPanelLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="패널 닫기"
        className="fixed inset-0 bg-black/65"
        style={{ zIndex: "var(--z-overlay)" }}
        onClick={onClose}
      />
      <aside
        className={cn(
          "detail-panel pointer-events-auto fixed inset-y-0 right-0 flex h-dvh w-full flex-col",
          "border-l border-border bg-background-elevated md:w-1/2",
        )}
        style={{ zIndex: "calc(var(--z-overlay) + 1)" }}
        aria-label={`${title} 상세`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-8 py-5">
          <span className="text-muted font-mono text-xs uppercase tracking-widest">
            {badge}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground rounded-full border border-border px-3 py-1 text-sm transition-colors"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 py-8"
          data-lenis-prevent
        >
          {children}
        </div>
      </aside>
    </>
  );
}
