"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { GetDemoModal } from "@/components/landing/get-demo-modal";

interface DemoModalContextType {
  openDemoModal: (source?: string) => void;
  closeDemoModal: () => void;
  isDemoModalOpen: boolean;
}

const DemoModalContext = createContext<DemoModalContextType | undefined>(undefined);

export function DemoModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDemoModal = useCallback((source: string = "direct") => {
    if (typeof window !== "undefined") {
      const umami = (
        window as unknown as {
          umami?: { track: (event: string, data?: Record<string, unknown>) => void };
        }
      ).umami;
      if (typeof umami?.track === "function") {
        umami.track("Get Demo Click", { source });
      }
    }
    setIsOpen(true);
  }, []);

  const closeDemoModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <DemoModalContext.Provider
      value={{
        openDemoModal,
        closeDemoModal,
        isDemoModalOpen: isOpen,
      }}
    >
      {children}
      <GetDemoModal isOpen={isOpen} onClose={closeDemoModal} />
    </DemoModalContext.Provider>
  );
}

export function useDemoModal() {
  const context = useContext(DemoModalContext);
  if (!context) {
    throw new Error("useDemoModal must be used within a DemoModalProvider");
  }
  return context;
}
