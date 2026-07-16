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
  variant?: "carousel" | "featured";
};

const SeriesCard = ({
  series,
  language,
  enrollment,
  onSelect,
  onViewPlans,
  variant = "carousel",
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

  if (variant === "featured") {
    return (
      <article className="group relative overflow-hidden rounded-3xl bg-slate-900 shadow-lg shadow-slate-900/10">
        <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-700 to-[#102544]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/70">
              {t("plans.featured_practice", "Featured practice")}
            </p>
            <h2
              className={`max-w-xl text-2xl font-semibold text-white sm:text-3xl ${contentFontClass}`}
            >
              {title}
            </h2>
            {description && (
              <p
                className={`mt-2 max-w-xl line-clamp-2 text-sm text-white/80 sm:text-base ${contentFontClass}`}
              >
                {description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/65">
              {series.enrolled_count > 0 && (
                <span>
                  {series.enrolled_count.toLocaleString()}{" "}
                  {t("plans.practicing_label", "practicing")}
                </span>
              )}
              {series.total_days > 0 && (
                <span>
                  {series.total_days} {t("plans.days_label", "days")}
                </span>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSelect(series.id)}
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={
                  isEnrolled
                    ? t("plans.continue", "Continue")
                    : t("plans.start", "Start")
                }
              >
                {isEnrolled
                  ? t("plans.continue", "Continue")
                  : t("plans.start", "Start")}
              </button>
              <button
                type="button"
                onClick={() => onViewPlans(series.id)}
                className="rounded-full border border-white/40 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {t("plans.view_chapters", "View chapters")}
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex w-[9.75rem] shrink-0 flex-col sm:w-[11.5rem]">
      <button
        type="button"
        onClick={() => onViewPlans(series.id)}
        className="flex flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102544]/40 focus-visible:ring-offset-2 rounded-2xl"
        aria-label={title}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-200">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-slate-400">
              <span className="text-3xl font-serif">☸</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 pt-10 opacity-0 transition group-hover:opacity-100">
            <span className="text-xs font-medium text-white">
              {isEnrolled
                ? t("plans.continue", "Continue")
                : t("plans.start", "Start")}
            </span>
          </div>
        </div>
        <div className="mt-3 space-y-1 px-0.5">
          <h2
            className={`line-clamp-2 text-[0.95rem] font-semibold leading-snug text-slate-900 ${contentFontClass}`}
          >
            {title}
          </h2>
          <p className="text-xs text-slate-500">
            {series.plan_count}{" "}
            {t(
              "plans.plan_count_label",
              series.plan_count === 1 ? "plan" : "plans",
            )}
            {series.total_days > 0 && (
              <>
                {" · "}
                {series.total_days} {t("plans.days_label", "days")}
              </>
            )}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onSelect(series.id)}
        className="mt-3 w-full rounded-full bg-[#102544] py-2 text-xs font-semibold text-white transition hover:bg-[#0c1c34] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102544]/50"
      >
        {isEnrolled
          ? t("plans.continue", "Continue")
          : t("plans.start", "Start")}
      </button>
    </article>
  );
};

export default SeriesCard;
