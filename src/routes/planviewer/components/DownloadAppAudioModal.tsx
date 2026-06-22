import { useTranslate } from "@tolgee/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog.tsx";
import { APP_STORE_URL, PLAY_STORE_URL } from "../../../utils/constants.ts";

type DownloadAppAudioModalProps = {
  open: boolean;
  onClose: () => void;
};

const DownloadAppAudioModal = ({
  open,
  onClose,
}: DownloadAppAudioModalProps) => {
  const { t } = useTranslate();
  const isApple = /iPhone|iPad|iPod/i.test(navigator.userAgent);

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
            {t(
              "plans.download_app_audio_body",
              "Download the WeBuddhist app to play all daily audio smoothly and track your practice.",
            )}
          </DialogDescription>
        </DialogHeader>
        <a
          href={isApple ? APP_STORE_URL : PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          {t("plans.download_app", "Download app")}
        </a>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadAppAudioModal;
