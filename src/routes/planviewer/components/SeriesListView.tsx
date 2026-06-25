import { useMemo } from "react";
import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import {
  fetchPublicSeries,
  fetchUserSeriesEnrollments,
} from "../api/plansApi.ts";
import SeriesCard from "./SeriesCard.tsx";
import VerseOfDayCard from "./VerseOfDayCard.tsx";
import { getEarlyReturn } from "../../../utils/helperFunctions.tsx";
import { siteName } from "../../../utils/constants.ts";
import Seo from "../../commons/seo/Seo.tsx";
import type { PlanLanguageCode } from "../utils/seriesUtils.ts";

type SeriesListViewProps = {
  apiLanguage: string;
  language: PlanLanguageCode;
  isAuthenticated: boolean;
  onSelectSeries: (seriesId: string) => void;
  onViewSeriesPlans: (seriesId: string) => void;
};

const SeriesListView = ({
  apiLanguage,
  language,
  isAuthenticated,
  onSelectSeries,
  onViewSeriesPlans,
}: SeriesListViewProps) => {
  const { t } = useTranslate();

  const {
    data: seriesData,
    isLoading: isSeriesLoading,
    error: seriesError,
  } = useQuery(
    ["public-series", apiLanguage],
    () => fetchPublicSeries(apiLanguage),
    { refetchOnWindowFocus: false },
  );

  const { data: enrollmentsData } = useQuery(
    ["user-series-enrollments", apiLanguage],
    () => fetchUserSeriesEnrollments(apiLanguage),
    {
      enabled: isAuthenticated,
      refetchOnWindowFocus: false,
    },
  );

  const enrollmentBySeriesId = useMemo(() => {
    const map = new Map<
      string,
      NonNullable<typeof enrollmentsData>["enrollments"][number]
    >();
    enrollmentsData?.enrollments.forEach((entry) => {
      map.set(entry.series_id, entry);
    });
    return map;
  }, [enrollmentsData]);

  const earlyReturn = getEarlyReturn({
    isLoading: isSeriesLoading,
    error: seriesError,
    t,
  });
  if (earlyReturn) return earlyReturn;

  const seriesList = seriesData?.series ?? [];

  return (
    <>
      <Seo
        title={`${t("plans.practice_routines", "Practice Routines")} | ${siteName}`}
        description={t(
          "plans.practice_routines_description",
          "Daily Buddhist study plans and practice routines.",
        )}
        canonical={`${window.location.origin}/`}
      />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 pb-10">
        <VerseOfDayCard apiLanguage={apiLanguage} />

        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t("plans.practice_routines", "Practice Routines")}
          </h1>
        </header>
        {seriesList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 px-6 py-12 text-center">
            <p className="text-gray-600">
              {t(
                "plans.no_series_available",
                "No practice routines available yet.",
              )}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {seriesList.map((series) => (
              <SeriesCard
                key={series.id}
                series={series}
                language={language}
                enrollment={enrollmentBySeriesId.get(series.id)}
                onSelect={onSelectSeries}
                onViewPlans={onViewSeriesPlans}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SeriesListView;
