import { useTranslate } from "@tolgee/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/utils/constants";

type DownloadAppModalProps = {
  open: boolean;
  onClose: () => void;
  description?: string;
};

const DownloadAppModal = ({
  open,
  onClose,
  description,
}: DownloadAppModalProps) => {
  const { t } = useTranslate();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border border-stone-200 bg-[#FAF9F6] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-stone-900">
            {t(
              "plans.download_app_title",
              "Get the app for the full experience",
            )}
          </DialogTitle>
          <DialogDescription className="text-stone-600">
            {description ??
              t(
                "plans.download_app_qr_body",
                "Scan the QR code with your phone or download from your app store.",
              )}
          </DialogDescription>
        </DialogHeader>
        <img
          src="/img/QR-download.png"
          alt={t("plans.download_app_qr_alt", "QR code to download WeBuddhist")}
          className="mx-auto w-full max-w-[220px] rounded-2xl"
          width={220}
          height={220}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            {t("plans.download_app_store", "App Store")}
          </a>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-50"
          >
            {t("plans.download_app_play", "Google Play")}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadAppModal;
