import {
  APPLE_STORE_URL,
  DISMISS_KEY,
  DISMISS_TIME_INTERVAL_MS,
  PLAY_STORE_URL,
} from "@/utils/constants";
import { useEffect, useState } from "react";

export default function AppOpenBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - Number(dismissedAt);
      if (elapsed < DISMISS_TIME_INTERVAL_MS) return;
    }

    setVisible(true);
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  const handleOpenApp = () => {
    // Universal / App Links only
    window.location.href = window.location.href;
  };

  const isAndroid = /Android/i.test(navigator.userAgent);
  const downloadUrl = isAndroid ? PLAY_STORE_URL : APPLE_STORE_URL;
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
            href={downloadUrl}
            target="_blank"
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
