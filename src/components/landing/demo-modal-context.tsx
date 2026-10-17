"use client";

import React, { createContext, useContext, useState } from "react";
import { GetDemoModal } from "@/components/landing/get-demo-modal";

interface DemoModalContextType {
  openDemoModal: () => void;
  closeDemoModal: () => void;
  isDemoModalOpen: boolean;
}

const DemoModalContext = createContext<DemoModalContextType | undefined>(undefined);

export function DemoModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DemoModalContext.Provider
      value={{
        openDemoModal: () => setIsOpen(true),
        closeDemoModal: () => setIsOpen(false),
        isDemoModalOpen: isOpen,
      }}
    >
      {children}
      <GetDemoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
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
