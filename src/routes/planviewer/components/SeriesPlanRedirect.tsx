import { useEffect } from "react";
import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { useSearchParams } from "react-router-dom";
import { fetchSeriesDetail } from "../api/plansApi.ts";
import { resolveTodaysPlanId } from "../utils/planStatusUtils.ts";
import type { PlanLanguageCode } from "../utils/seriesUtils.ts";
import { getEarlyReturn } from "../../../utils/helperFunctions.tsx";

type SeriesPlanRedirectProps = {
  seriesId: string;
  language: PlanLanguageCode;
  apiLanguage: string;
  urlLanguage: string;
  onBack: () => void;
};

const SeriesPlanRedirect = ({
  seriesId,
  language,
  apiLanguage,
  urlLanguage,
  onBack,
}: SeriesPlanRedirectProps) => {
  const { t } = useTranslate();
  const [, setSearchParams] = useSearchParams();

  const {
    data: series,
    isLoading: isSeriesLoading,
    error: seriesError,
  } = useQuery(
    ["series-detail", seriesId, apiLanguage],
    () => fetchSeriesDetail(seriesId, apiLanguage),
    { refetchOnWindowFocus: false },
  );

  useEffect(() => {
    if (!series) return;

    const planId = resolveTodaysPlanId(series.plans, language);
    if (!planId) return;

    const params: Record<string, string> = {
      series: seriesId,
      plan: planId,
    };
    if (urlLanguage !== "en") params.lang = urlLanguage;
    setSearchParams(params, { replace: true });
  }, [series, language, seriesId, urlLanguage, setSearchParams]);

  const earlyReturn = getEarlyReturn({
    isLoading: isSeriesLoading,
    error: seriesError,
    t,
  });
  if (earlyReturn) return earlyReturn;

  if (!series) return null;

  const planId = resolveTodaysPlanId(series.plans, language);

  if (!planId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center">
        <p className="text-sm text-stone-500">
          {t(
            "plans.no_plans_available",
            "No plans available in this language.",
          )}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-sm font-medium text-stone-900 underline"
        >
          {t("plans.back_to_routines", "All routines")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-[#FAF9F6] text-stone-500">
      {t("common.loading", "Loading...")}
    </div>
  );
};

export default SeriesPlanRedirect;
