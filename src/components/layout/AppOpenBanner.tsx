import {
  APP_SCHEME_URL,
  DISMISS_KEY,
  DISMISS_TIME_INTERVAL_MS,
  PLAY_STORE_URL,
  APP_STORE_URL,
} from "@/utils/constants";
import { useEffect, useState } from "react";

export default function AppOpenBanner() {
  const [visible, setVisible] = useState(false);
  const [isAppleDevice, setIsAppleDevice] = useState(false);

  useEffect(() => {
    // Mobile only
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Detect Apple devices
    const isApple = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsAppleDevice(isApple);

    const dismissedAt = localStorage.getItem(DISMISS_KEY);

    if (dismissedAt) {
      const elapsed = Date.now() - Number(dismissedAt);
      if (elapsed < DISMISS_TIME_INTERVAL_MS) return; // still within 1 day
    }

    setVisible(true);
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  const handleOpenApp = () => {
    const { pathname, search, hash } = window.location;

    // 1. Try Universal / App Link (primary)
    window.location.href = window.location.href;

    // 2. Scheme fallback (preserve path)
    const schemeUrl =
      APP_SCHEME_URL + pathname.replace(/^\/+/, "") + search + hash;

    setTimeout(() => {
      window.location.href = schemeUrl;
    }, 1500);
  };

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
          <a
            href={isAppleDevice ? APP_STORE_URL : PLAY_STORE_URL}
            className="px-3 py-1.5 text-sm rounded-md bg-amber-600 text-white hover:bg-amber-700"
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
