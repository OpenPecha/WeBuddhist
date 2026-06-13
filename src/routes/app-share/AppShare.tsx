import { useEffect, useState } from "react";
import { APP_STORE_URL, PLAY_STORE_URL, siteName } from "../../utils/constants";

type MobileDeviceType = "android" | "apple" | null;

const getMobileDeviceType = (): MobileDeviceType => {
  if (typeof window === "undefined" || !window.navigator?.userAgent)
    return null;

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) return "apple";
  if (/android/.test(userAgent)) return "android";

  return null;
};

const STORE_URLS: Record<NonNullable<MobileDeviceType>, string> = {
  apple: APP_STORE_URL,
  android: PLAY_STORE_URL,
};

const AppShare = () => {
  const [showDownloadLinks, setShowDownloadLinks] = useState(false);

  useEffect(() => {
    const deviceType = getMobileDeviceType();

    if (deviceType) {
      window.location.replace(STORE_URLS[deviceType]);
      return;
    }

    setShowDownloadLinks(true);
  }, []);

  if (!showDownloadLinks) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-sm text-gray-500">Redirecting to the app store…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-gray-900">
          Get {siteName}
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Download the app for daily reading, practice, and community on your
          device.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Download ${siteName} on the App Store`}
            className="flex items-center justify-center rounded-md bg-amber-600 px-4 py-3 text-sm font-medium text-white hover:bg-amber-700"
          >
            Download on the App Store
          </a>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Download ${siteName} on Google Play`}
            className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Get it on Google Play
          </a>
        </div>
      </div>
    </div>
  );
};

export default AppShare;
