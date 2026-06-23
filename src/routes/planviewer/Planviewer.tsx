import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTolgee } from "@tolgee/react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "../../config/AuthContext.tsx";
import { LANGUAGE } from "../../utils/constants.ts";
import { mapLanguageCode } from "../../utils/helperFunctions.tsx";
import SeriesListView from "./components/SeriesListView.tsx";
import SeriesPlanRedirect from "./components/SeriesPlanRedirect.tsx";
import DailyPlanView from "./components/DailyPlanView.tsx";
import { apiLanguageParam, tolgeeToPlanLanguage } from "./utils/seriesUtils.ts";

const Planviewer = () => {
  const tolgee = useTolgee(["language"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn, isAuthLoading, isTokenReady } = useAuth() as {
    isLoggedIn: boolean;
    isAuthLoading: boolean;
    isTokenReady: boolean;
  };
  const { isAuthenticated, isLoading: isAuth0Loading } = useAuth0();

  const storedLanguage =
    tolgee.getLanguage() || localStorage.getItem(LANGUAGE) || "en";
  const apiLanguage = mapLanguageCode(storedLanguage);
  const planLanguage = tolgeeToPlanLanguage(storedLanguage);
  const tolgeeApiLanguage = apiLanguageParam(storedLanguage);

  const selectedSeriesId = searchParams.get("series");
  const selectedPlanId = searchParams.get("plan");
  const selectedDate = searchParams.get("date");
  const isAuthenticatedReady =
    !isAuthLoading &&
    !isAuth0Loading &&
    isTokenReady &&
    (isLoggedIn || isAuthenticated);

  const handleSelectSeries = useCallback(
    (seriesId: string) => {
      setSearchParams({ series: seriesId, lang: apiLanguage });
    },
    [apiLanguage, setSearchParams],
  );

  const handleBackToList = useCallback(() => {
    setSearchParams(apiLanguage !== "en" ? { lang: apiLanguage } : {});
  }, [apiLanguage, setSearchParams]);

  const handleBackToSeries = useCallback(() => {
    setSearchParams(apiLanguage !== "en" ? { lang: apiLanguage } : {});
  }, [apiLanguage, setSearchParams]);

  const handleDateChange = useCallback(
    (date: string | null) => {
      if (!selectedSeriesId || !selectedPlanId) return;
      const params: Record<string, string> = {
        series: selectedSeriesId,
        plan: selectedPlanId,
        lang: apiLanguage,
      };
      if (date) params.date = date;
      setSearchParams(params);
    },
    [apiLanguage, selectedSeriesId, selectedPlanId, setSearchParams],
  );

  const content = useMemo(() => {
    if (selectedSeriesId && selectedPlanId) {
      return (
        <DailyPlanView
          planId={selectedPlanId}
          apiLanguage={tolgeeApiLanguage}
          selectedDate={selectedDate}
          isAuthenticated={isAuthenticatedReady}
          onBack={handleBackToSeries}
          onDateChange={handleDateChange}
        />
      );
    }

    if (selectedSeriesId) {
      return (
        <SeriesPlanRedirect
          seriesId={selectedSeriesId}
          language={planLanguage}
          apiLanguage={tolgeeApiLanguage}
          urlLanguage={apiLanguage}
          onBack={handleBackToList}
        />
      );
    }

    return (
      <SeriesListView
        apiLanguage={tolgeeApiLanguage}
        language={planLanguage}
        isAuthenticated={isAuthenticatedReady}
        onSelectSeries={handleSelectSeries}
      />
    );
  }, [
    selectedSeriesId,
    selectedPlanId,
    selectedDate,
    planLanguage,
    tolgeeApiLanguage,
    isAuthenticatedReady,
    handleBackToList,
    handleBackToSeries,
    handleDateChange,
    handleSelectSeries,
  ]);

  return <div className="min-h-[calc(100dvh-4rem)] w-full">{content}</div>;
};

export default Planviewer;
