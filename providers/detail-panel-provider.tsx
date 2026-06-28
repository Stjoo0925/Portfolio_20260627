"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DetailPanelContextValue = {
  isOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
};

const DetailPanelContext = createContext<DetailPanelContextValue>({
  isOpen: false,
  openPanel: () => {},
  closePanel: () => {},
});

export function DetailPanelProvider({ children }: { children: ReactNode }) {
  const [openCount, setOpenCount] = useState(0);

  const openPanel = useCallback(() => {
    setOpenCount((count) => count + 1);
  }, []);

  const closePanel = useCallback(() => {
    setOpenCount((count) => Math.max(0, count - 1));
  }, []);

  const value = useMemo(
    () => ({
      isOpen: openCount > 0,
      openPanel,
      closePanel,
    }),
    [openCount, openPanel, closePanel],
  );

  return (
    <DetailPanelContext.Provider value={value}>
      {children}
    </DetailPanelContext.Provider>
  );
}

export function useDetailPanel() {
  return useContext(DetailPanelContext);
}
