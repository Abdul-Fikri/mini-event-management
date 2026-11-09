"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

const LottieLoader = dynamic(
  () => import("@/components/ui/LottieLoader"),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600" />
        <span className="sr-only">Sedang memuat...</span>
      </div>
    ),
  },
);

const AppLoadingContext = createContext({
  setFormPending: () => {},
});

export function useAppLoading() {
  return useContext(AppLoadingContext);
}

export default function AppLoadingProvider({ children }) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const navigationStartedAt = useRef(0);
  const [navigationPending, setNavigationPending] = useState(false);
  const [pendingForms, setPendingForms] = useState(() => new Set());

  const setFormPending = useCallback((id, pending) => {
    setPendingForms((current) => {
      if (current.has(id) === pending) return current;

      const next = new Set(current);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (pathname === previousPathname.current) return;

    previousPathname.current = pathname;
    if (!navigationPending) return;

    const elapsed = Date.now() - navigationStartedAt.current;
    const timer = window.setTimeout(
      () => setNavigationPending(false),
      Math.max(0, 250 - elapsed),
    );

    return () => window.clearTimeout(timer);
  }, [pathname, navigationPending]);

  useEffect(() => {
    if (!navigationPending) return;

    // Prevent a stuck overlay if navigation is interrupted or fails.
    const timer = window.setTimeout(() => setNavigationPending(false), 12000);
    return () => window.clearTimeout(timer);
  }, [navigationPending]);

  function handleNavigationClick(event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = event.target;
    const anchor =
      target instanceof Element ? target.closest("a[href]") : null;

    if (
      !anchor ||
      anchor.hasAttribute("download") ||
      (anchor.target && anchor.target !== "_self")
    ) {
      return;
    }

    const destination = new URL(anchor.href, window.location.href);
    if (
      destination.origin !== window.location.origin ||
      destination.pathname === window.location.pathname
    ) {
      return;
    }

    navigationStartedAt.current = Date.now();
    setNavigationPending(true);
  }

  const isLoading = navigationPending || pendingForms.size > 0;
  const label =
    pendingForms.size > 0
      ? "Sedang memproses..."
      : "Sedang memuat halaman...";

  return (
    <AppLoadingContext.Provider value={{ setFormPending }}>
      <div onClickCapture={handleNavigationClick}>
        {children}
        {isLoading ? <LottieLoader label={label} overlay /> : null}
      </div>
    </AppLoadingContext.Provider>
  );
}
