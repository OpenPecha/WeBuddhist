import {
  APP_SCHEME_URL,
  APPLE_STORE_URL,
  DISMISS_KEY,
  DISMISS_TIME_INTERVAL_MS,
  PLAY_STORE_URL,
} from "@/utils/constants";
import { useEffect, useState, useRef } from "react";

export default function AppOpenBanner() {
  const [visible, setVisible] = useState(false);
  // Store timeout ID - setTimeout returns number in browser environments
  const visibilityTimeoutRef = useRef(null);

  useEffect(() => {
    // Mobile only
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;

    const dismissedAt = localStorage.getItem(DISMISS_KEY);

    if (dismissedAt) {
      const elapsed = Date.now() - Number(dismissedAt);
      if (elapsed < DISMISS_TIME_INTERVAL_MS) return; // still within 1 day
    }

    setVisible(true);
  }, []);

  useEffect(() => {
    // Cleanup timeout on unmount
    const ref = visibilityTimeoutRef;
    return () => {
      if (ref.current) {
        clearTimeout(ref.current);
      }
    };
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  const handleOpenApp = () => {
    const { pathname, search, hash } = globalThis.location;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Page became hidden - OS switched to app
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
        if (visibilityTimeoutRef.current) {
          clearTimeout(visibilityTimeoutRef.current);
        }
      }
    };

    // Listen for visibility changes before attempting to open
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Attempt to open app via custom scheme (preserves current path)
    // Universal Links would be handled by the OS if configured
    const schemeUrl =
      APP_SCHEME_URL + pathname.replace(/^\/+/, "") + search + hash;
    globalThis.location.href = schemeUrl;

    // Clean up listener after timeout
    // If page stays visible, app didn't open - user remains on web
    const timeoutId = setTimeout(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, 1000);
    // @ts-ignore - setTimeout returns number in browser, but types may show Node.js Timeout
    visibilityTimeoutRef.current = timeoutId;
  };
  const isAndroid = /Android/i.test(navigator.userAgent);
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t shadow-md">
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold">Open in WebBuddhist App</span>
          <span className="text-xs text-gray-500">
            Faster reading, offline access
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenApp}
            className="px-3 py-1.5 text-sm rounded-md bg-amber-600 text-white hover:bg-amber-700"
          >
            Open
          </button>

          <a
            href={isAndroid ? PLAY_STORE_URL : APPLE_STORE_URL}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300"
          >
            Get App
          </a>

          <button
            onClick={handleDismiss}
            className="text-gray-400 text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
