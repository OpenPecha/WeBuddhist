import { useTranslate } from "@tolgee/react";
import type { SeriesListItemDTO, UserSeriesEnrollmentDTO } from "../types.ts";
import {
  getSeriesDescriptionForLanguage,
  getSeriesTitleForLanguage,
  resolveImageUrl,
  type PlanLanguageCode,
} from "../utils/seriesUtils.ts";
import { getLanguageClass } from "../../../utils/helperFunctions.tsx";

type SeriesCardProps = {
  series: SeriesListItemDTO;
  language: PlanLanguageCode;
  enrollment?: UserSeriesEnrollmentDTO;
  onSelect: (seriesId: string) => void;
  onViewPlans: (seriesId: string) => void;
};

const SeriesCard = ({
  series,
  language,
  enrollment,
  onSelect,
  onViewPlans,
}: SeriesCardProps) => {
  const { t } = useTranslate();
  const title = getSeriesTitleForLanguage(series.metadata, language);
  const description = getSeriesDescriptionForLanguage(
    series.metadata,
    language,
  );
  const imageUrl = resolveImageUrl(series.image);
  const contentFontClass = getLanguageClass(language);
  const isEnrolled = Boolean(enrollment);

  return (
    <div className="group flex w-full flex-col overflow-hidden rounded-2xl border border-amber-100 bg-white text-left shadow-sm transition hover:border-amber-300 hover:shadow-md focus-within:ring-2 focus-within:ring-amber-500">
      <button
        type="button"
        onClick={() => onViewPlans(series.id)}
        className="flex flex-1 flex-col text-left focus:outline-none"
        aria-label={title}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-amber-50">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700/40">
              <span className="text-4xl font-serif">☸</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h2
            className={`text-lg font-semibold text-gray-900 ${contentFontClass}`}
          >
            {title}
          </h2>
          {description && (
            <p
              className={`line-clamp-2 text-sm text-gray-600 pt-2 ${contentFontClass}`}
            >
              {description}
            </p>
          )}
          <div className="mt-auto flex flex-wrap gap-3 text-xs text-gray-500">
            <span>
              {series.plan_count}{" "}
              {t(
                "plans.plan_count_label",
                series.plan_count === 1 ? "plan" : "plans",
              )}
            </span>
            {series.total_days > 0 && (
              <span>
                {series.total_days} {t("plans.days_label", "days")}
              </span>
            )}
            {series.enrolled_count > 0 && (
              <span>
                {series.enrolled_count.toLocaleString()}{" "}
                {t("plans.enrolled_label", "enrolled")}
              </span>
            )}
          </div>
        </div>
      </button>
      <div className="flex gap-2 px-4 pb-4">
        <button
          type="button"
          onClick={() => onSelect(series.id)}
          className="flex-1 rounded-full bg-stone-900 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          {isEnrolled
            ? t("plans.continue", "Continue")
            : t("plans.start", "Start")}
        </button>
        <button
          type="button"
          onClick={() => onViewPlans(series.id)}
          className="flex-1 rounded-full border border-stone-300 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          {t("plans.view_chapters", "View chapters")}
        </button>
      </div>
    </div>
  );
};

export default SeriesCard;
