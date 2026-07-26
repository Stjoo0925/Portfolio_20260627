"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useDetailPanelLock } from "@/hooks/use-detail-panel-lock";

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useMounted() {
  return useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );
}

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
  const mounted = useMounted();

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
    // The page's actual scroll container is the root <html> element, not
    // <body> — locking only body.style.overflow left html free to keep
    // scrolling behind the panel while .detail-panel-body scrolled its own
    // content, producing two independent scrollbars at once.
    const root = document.documentElement;
    const previousRoot = root.style.overflow;
    const previousBody = document.body.style.overflow;
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousRoot;
      document.body.style.overflow = previousBody;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="패널 닫기"
        className="detail-backdrop"
        onClick={onClose}
      />
      <aside
        className="detail-panel detail-panel-shell"
        aria-label={`${title} 상세`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="detail-panel-header">
          <div className="detail-panel-heading">
            <h2>
              {title}
            </h2>
            <p>
              {badge}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="detail-panel-close"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div
          className="detail-body detail-panel-body"
        >
          {children}
        </div>
      </aside>
    </>,
    document.body,
  );
}
