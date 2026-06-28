"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="패널 닫기"
        className="fixed inset-0 bg-black/70 backdrop-blur-[2px]"
        style={{ zIndex: "var(--z-overlay)" }}
        onClick={onClose}
      />
      <aside
        className={cn(
          "detail-panel pointer-events-auto fixed inset-y-0 right-0 flex h-dvh w-full flex-col",
          "border-l border-border bg-background-elevated shadow-2xl md:max-w-[min(72vw,56rem)] md:w-full",
        )}
        style={{ zIndex: "calc(var(--z-overlay) + 1)" }}
        aria-label={`${title} 상세`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-8">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="font-display text-balance break-keep text-xl font-bold leading-snug md:text-2xl">
              {title}
            </h2>
            <p className="text-muted mt-1.5 font-mono text-xs leading-relaxed tracking-widest break-keep uppercase">
              {badge}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground shrink-0 rounded-full border border-border px-3 py-1 text-sm transition-colors"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div
          className="detail-body min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 md:px-8 md:py-8"
          data-lenis-prevent
        >
          {children}
        </div>
      </aside>
    </>,
    document.body,
  );
}
