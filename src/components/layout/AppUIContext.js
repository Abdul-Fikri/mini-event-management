"use client";

import { createContext, useContext, useMemo, useState } from "react";

const AppUIContext = createContext(null);

export function AppUIProvider({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const value = useMemo(
    () => ({
      mobileNavOpen,
      openMobileNav: () => setMobileNavOpen(true),
      closeMobileNav: () => setMobileNavOpen(false),
      toggleMobileNav: () => setMobileNavOpen((current) => !current),
    }),
    [mobileNavOpen]
  );

  return (
    <AppUIContext.Provider value={value}>
      {children}
    </AppUIContext.Provider>
  );
}

export function useAppUI() {
  const context = useContext(AppUIContext);
  if (!context) {
    throw new Error("useAppUI harus digunakan di dalam AppUIProvider.");
  }
  return context;
}
