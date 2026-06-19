import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useTranslate } from "@tolgee/react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import {
  enrollInSeries,
  fetchSeriesDetail,
  fetchUserSeriesProgress,
} from "../api/plansApi.ts";
import SeriesPlanRow from "./SeriesPlanRow.tsx";
import {
  filterPlansByLanguage,
  getSeriesCardTitle,
  getSeriesNavTitle,
  resolveImageUrl,
  type PlanLanguageCode,
} from "../utils/seriesUtils.ts";
import { getPlanRowStatus } from "../utils/planStatusUtils.ts";
import {
  getEarlyReturn,
  getLanguageClass,
} from "../../../utils/helperFunctions.tsx";

type SeriesDetailViewProps = {
  seriesId: string;
  language: PlanLanguageCode;
  apiLanguage: string;
  isAuthenticated: boolean;
  onBack: () => void;
  onSelectPlan: (planId: string) => void;
};

const SeriesDetailView = ({
  seriesId,
  language,
  apiLanguage,
  isAuthenticated,
  onBack,
  onSelectPlan,
}: SeriesDetailViewProps) => {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = useMemo(() => new Date(), []);

  const {
    data: series,
    isLoading: isSeriesLoading,
    error: seriesError,
  } = useQuery(
    ["series-detail", seriesId, apiLanguage],
    () => fetchSeriesDetail(seriesId, apiLanguage),
    { refetchOnWindowFocus: false },
  );

  const { data: userProgress, isLoading: isProgressLoading } = useQuery(
    ["user-series-progress", seriesId, apiLanguage],
    () => fetchUserSeriesProgress(seriesId, apiLanguage),
    {
      enabled: isAuthenticated,
      refetchOnWindowFocus: false,
    },
  );

  const enrollMutation = useMutation(() => enrollInSeries(seriesId), {
    onSuccess: () => {
      queryClient.invalidateQueries(["user-series-progress", seriesId]);
      queryClient.invalidateQueries(["user-series-enrollments"]);
    },
  });

  const visiblePlans = useMemo(
    () => filterPlansByLanguage(series?.plans ?? [], language),
    [series?.plans, language],
  );

  const earlyReturn = getEarlyReturn({
    isLoading: isSeriesLoading,
    error: seriesError,
    t,
  });
  if (earlyReturn) return earlyReturn;

  if (!series) return null;

  const navTitle = getSeriesNavTitle(series.metadata, language);
  const cardTitle = getSeriesCardTitle(series.metadata, language);
  const imageUrl = resolveImageUrl(series.image);
  const isEnrolled = Boolean(userProgress);
  const planCount = visiblePlans.length;
  const totalDays =
    series.total_days || visiblePlans.reduce((s, p) => s + p.total_days, 0);
  const contentFontClass = getLanguageClass(apiLanguage);

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isEnrolled) {
      const currentId = userProgress?.current_plan_id ?? visiblePlans[0]?.id;
      if (currentId) onSelectPlan(currentId);
      return;
    }
    enrollMutation.mutate();
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[#FAF9F6] text-stone-900">
      <div className="mx-auto w-full max-w-lg px-4 pb-10 pt-2">
        <div className="relative mb-5 flex items-center justify-center py-3">
          <button
            type="button"
            onClick={onBack}
            className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full text-stone-900 hover:bg-stone-200/60"
            aria-label={t("plans.back_to_routines", "All routines")}
          >
            <IoArrowBack className="text-xl" />
          </button>
          <h1
            className={`text-base font-bold tracking-tight text-stone-900 ${contentFontClass}`}
          >
            {navTitle}
          </h1>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-100">
          {imageUrl && (
            <div className="aspect-[16/10] w-full overflow-hidden">
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="space-y-3 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
              {planCount} {t("plans.plans_label", "PLANS")} · {totalDays}{" "}
              {t("plans.days_upper", "DAYS")}
            </p>
            <h2
              className={`text-xl font-bold leading-snug text-stone-900 ${contentFontClass}`}
            >
              {cardTitle}
            </h2>
            <button
              type="button"
              onClick={handleEnroll}
              disabled={enrollMutation.isLoading}
              className="w-full rounded-full bg-stone-900 py-3.5 text-[15px] font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
            >
              {enrollMutation.isLoading
                ? t("common.loading", "Loading...")
                : isEnrolled
                  ? t("plans.continue", "Continue")
                  : t("plans.enroll", "Enroll")}
            </button>
          </div>
        </div>

        <div className="mt-1">
          {visiblePlans.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-500">
              {t(
                "plans.no_plans_available",
                "No plans available in this language.",
              )}
            </p>
          ) : (
            visiblePlans.map((plan) => (
              <SeriesPlanRow
                key={plan.id}
                plan={plan}
                status={getPlanRowStatus(
                  plan,
                  visiblePlans,
                  today,
                  userProgress?.current_plan_id,
                )}
                contentFontClass={contentFontClass}
                onSelect={onSelectPlan}
              />
            ))
          )}
        </div>

        {isAuthenticated && !isProgressLoading && !userProgress && (
          <p className="mt-6 text-center text-xs text-stone-500">
            {t(
              "plans.enroll_to_unlock",
              "Enroll to unlock upcoming plans as they become available.",
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default SeriesDetailView;
