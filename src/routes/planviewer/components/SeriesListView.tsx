import { useCallback, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import {
  fetchPublicSeries,
  fetchUserSeriesEnrollments,
} from "../api/plansApi.ts";
import SeriesCard from "./SeriesCard.tsx";
import VerseOfDayCard from "./VerseOfDayCard.tsx";
import PresetMantrasSection from "../../mantras/components/PresetMantrasSection.tsx";
import JoinableGroupsSection from "../../mantras/components/JoinableGroupsSection.tsx";
import { getEarlyReturn } from "../../../utils/helperFunctions.tsx";
import { siteDescription, siteName } from "../../../utils/constants.ts";
import Seo from "../../commons/seo/Seo.tsx";
import DownloadAppModal from "../../../components/DownloadAppModal.tsx";
import {
  isMobileDevice,
  openAppDownloadPage,
} from "../../../utils/deviceUtils.ts";
import type { PlanLanguageCode } from "../utils/seriesUtils.ts";

type SeriesListViewProps = {
  apiLanguage: string;
  language: PlanLanguageCode;
  isAuthenticated: boolean;
  onSelectSeries: (seriesId: string) => void;
  onViewSeriesPlans: (seriesId: string) => void;
  onViewAllGroups: () => void;
};

const SeriesListView = ({
  apiLanguage,
  language,
  isAuthenticated,
  onSelectSeries,
  onViewSeriesPlans,
  onViewAllGroups,
}: SeriesListViewProps) => {
  const { t } = useTranslate();
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const handleOpenApp = useCallback(() => {
    if (isMobileDevice()) {
      openAppDownloadPage();
      return;
    }
    setDownloadModalOpen(true);
  }, []);

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
  const featuredSeries =
    seriesList.find((series) => series.featured) ?? seriesList[0] ?? null;
  const carouselSeries = featuredSeries
    ? seriesList.filter((series) => series.id !== featuredSeries.id)
    : seriesList;

  return (
    <>
      <Seo
        title={`${t("plans.practice_routines", "Practice Routines")} | ${siteName}`}
        description={siteDescription}
        canonical={`${window.location.origin}/`}
      />
      <div className="min-h-[calc(100dvh-4rem)] bg-[#f4f6f8]">
        <VerseOfDayCard apiLanguage={apiLanguage} />

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-2 sm:px-6">
          {featuredSeries && (
            <section
              className="animate-[fadeInUp_0.6s_ease-out]"
              aria-label={t("plans.featured_practice", "Featured practice")}
            >
              <header className="mb-4 flex items-end justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  {t("plans.join_the_practice", "Join the Practice")}
                </h2>
              </header>
              <SeriesCard
                series={featuredSeries}
                language={language}
                enrollment={enrollmentBySeriesId.get(featuredSeries.id)}
                onSelect={onSelectSeries}
                onViewPlans={onViewSeriesPlans}
                variant="featured"
              />
            </section>
          )}

          {(carouselSeries.length > 0 || !featuredSeries) && (
            <section
              aria-label={t("plans.practice_routines", "Practice Routines")}
            >
              <header className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    {t("plans.practice_routines", "Practice Routines")}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {t(
                      "plans.practice_routines_subtitle",
                      "Build a daily habit with guided plans.",
                    )}
                  </p>
                </div>
              </header>

              {seriesList.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
                  <p className="text-slate-600">
                    {t(
                      "plans.no_series_available",
                      "No practice routines available yet.",
                    )}
                  </p>
                </div>
              ) : (
                <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
                  {(carouselSeries.length > 0
                    ? carouselSeries
                    : seriesList
                  ).map((series) => (
                    <SeriesCard
                      key={series.id}
                      series={series}
                      language={language}
                      enrollment={enrollmentBySeriesId.get(series.id)}
                      onSelect={onSelectSeries}
                      onViewPlans={onViewSeriesPlans}
                      variant="carousel"
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          <PresetMantrasSection
            apiLanguage={apiLanguage}
            language={language}
            onOpenApp={handleOpenApp}
          />

          <JoinableGroupsSection
            apiLanguage={apiLanguage}
            language={language}
            onOpenApp={handleOpenApp}
            onViewAllGroups={onViewAllGroups}
          />
        </div>
      </div>
      <DownloadAppModal
        open={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />
    </>
  );
};

export default SeriesListView;
