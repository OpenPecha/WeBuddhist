import { useNavigate } from "react-router-dom";
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
};

const PresetMantraCard = ({ preset, language }: PresetMantraCardProps) => {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const title = getPresetDisplayTitle(preset, language);
  const description = getPresetDisplayDescription(preset, language);
  const mantraText = preset.mantra?.mantra?.trim() ?? "";
  const imageUrl =
    preset.mala_image_url?.trim() ||
    preset.mantra?.mala_image_url?.trim() ||
    "";
  const contentFontClass = getLanguageClass(
    language === "BO" ? "bo-IN" : language === "ZH" ? "zh-Hans-CN" : "en",
  );

  const handleClick = () => {
    navigate("/app/share");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={t(
        "mantras.open_app_for_mantra",
        "Download the app to practice {title}",
        { title },
      )}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-amber-100 bg-white text-left shadow-sm transition hover:border-amber-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-amber-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700/50">
            <span className={`text-2xl font-medium ${contentFontClass}`}>
              ཨོཾ
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
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
    </button>
  );
};

export default PresetMantraCard;
