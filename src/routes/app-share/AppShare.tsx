import { useEffect, useState } from "react";
import DownloadAppModal from "../../components/DownloadAppModal.tsx";
import {
  isMobileDevice,
  openAppDownloadPage,
} from "../../utils/deviceUtils.ts";

const AppShare = () => {
  const [showModal, setShowModal] = useState(false);
  const mobile = isMobileDevice();

  useEffect(() => {
    if (mobile) {
      openAppDownloadPage();
      return;
    }
    setShowModal(true);
  }, [mobile]);

  if (mobile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-6">
        <p className="text-base font-medium text-gray-700">
          Opening WeBuddhist…
        </p>
      </div>
    );
  }

  return (
    <DownloadAppModal open={showModal} onClose={() => setShowModal(false)} />
  );
};

export default AppShare;
