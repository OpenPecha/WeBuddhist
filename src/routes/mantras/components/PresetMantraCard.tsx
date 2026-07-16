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
      className="group flex w-40 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102544]/40 focus-visible:ring-offset-2 sm:w-44"
    >
      <div className="relative flex aspect-square w-full items-center justify-center bg-linear-to-br from-amber-50/90 via-white to-slate-100 p-5">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 40%, rgba(251, 191, 36, 0.18), transparent 68%)",
          }}
          aria-hidden="true"
        />
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="relative z-10 h-[4.75rem] w-[4.75rem] object-contain drop-shadow-sm transition duration-300 group-hover:scale-105 sm:h-[5.25rem] sm:w-[5.25rem]"
          />
        ) : (
          <span
            className={`relative z-10 text-4xl font-medium text-amber-800/70 ${contentFontClass}`}
          >
            ཨོཾ
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 pt-2.5">
        <h3
          className={`line-clamp-2 text-sm font-semibold leading-snug text-slate-900 ${contentFontClass}`}
        >
          {title}
        </h3>
        {mantraText && (
          <p
            className={`line-clamp-2 text-xs leading-relaxed text-slate-500 ${contentFontClass}`}
          >
            {mantraText}
          </p>
        )}
        {!mantraText && description && (
          <p
            className={`line-clamp-2 text-xs leading-relaxed text-slate-500 ${contentFontClass}`}
          >
            {description}
          </p>
        )}
      </div>
    </button>
  );
};

export default PresetMantraCard;
