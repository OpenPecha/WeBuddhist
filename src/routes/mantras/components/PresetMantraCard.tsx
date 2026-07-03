import { useTranslate } from "@tolgee/react";
import type { PublicAccumulatorDTO } from "../types.ts";
import {
  getPresetDisplayDescription,
  getPresetDisplayTitle,
} from "../utils/groupUtils.ts";
import { getLanguageClass } from "../../../utils/helperFunctions.tsx";
import type { PlanLanguageCode } from "../../planviewer/utils/seriesUtils.ts";

type PresetMantraCardProps = {
  preset: PublicAccumulatorDTO;
  language: PlanLanguageCode;
  onOpenApp: () => void;
};

const PresetMantraCard = ({
  preset,
  language,
  onOpenApp,
}: PresetMantraCardProps) => {
  const { t } = useTranslate();
  const title = getPresetDisplayTitle(preset, language);
  const description = getPresetDisplayDescription(preset, language);
  const mantraText = preset.mantra?.mantra?.trim() ?? "";
  const imageUrl =
    preset.mantra?.mala_image_url?.trim() ||
    preset.mala_image_url?.trim() ||
    "";
  const contentFontClass = getLanguageClass(
    language === "BO" ? "bo-IN" : language === "ZH" ? "zh-Hans-CN" : "en",
  );

  const handleClick = () => {
    onOpenApp();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="relative  w-full overflow-hidden ">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-12 w-12 object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700/50">
              <span className={`text-2xl font-medium ${contentFontClass}`}>
                ཨོཾ
              </span>
            </div>
          )}
        </div>
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={t(
          "mantras.open_app_for_mantra",
          "Download the app to practice {title}",
          { title },
        )}
        className="flex flex-col w-full max-w-md gap-2 py-4 cursor-pointer outline-none"
        style={{ border: "none", background: "none" }}
      >
        <h3
          className={`text-lg font-semibold text-gray-900 ${contentFontClass}`}
        >
          {title}
        </h3>
        {mantraText && (
          <p
            className={`line-clamp-2 text-sm text-amber-900/80 ${contentFontClass}`}
          >
            {mantraText}
          </p>
        )}
        {description && (
          <p
            className={`line-clamp-2 text-sm text-gray-600 ${contentFontClass}`}
          >
            {description}
          </p>
        )}
        {preset.target_count != null && preset.target_count > 0 && (
          <p className="mt-auto text-xs text-gray-500">
            {t("mantras.target_count", "Target")}:{" "}
            {preset.target_count.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default PresetMantraCard;
