import { useEffect, useState } from "react";
import { APP_STORE_URL, PLAY_STORE_URL, siteName } from "../../utils/constants";
import { FaApple, FaAndroid } from "react-icons/fa";

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-gray-200 px-4">
        <div className="flex flex-col items-center">
          <span className="mb-4 text-3xl animate-bounce text-amber-600">
            <FaApple aria-label="Apple logo" className="inline mr-2" />
            <FaAndroid aria-label="Android logo" className="inline ml-2" />
          </span>
          <p className="text-base font-medium text-gray-700">
            Redirecting to the app store…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-9 flex gap-4 flex-col">
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Download ${siteName} on the App Store`}
        className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg bg-black px-5 py-5 text-base font-bold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <FaApple className="text-4xl" aria-hidden="true" />
        <span className="text-center text-sm">App Store</span>
      </a>

      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Download ${siteName} on Google Play`}
        className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-5 text-base font-bold text-gray-900 shadow-sm transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        <FaAndroid className="text-4xl text-green-500" aria-hidden="true" />
        <span className="text-center text-sm">Google Play</span>
      </a>
    </div>
  );
};

export default AppShare;
