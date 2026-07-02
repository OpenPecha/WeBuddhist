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
import GroupDetailView from "../mantras/components/GroupDetailView.tsx";
import GroupAccumulatorDetailView from "../mantras/components/GroupAccumulatorDetailView.tsx";
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
  const selectedGroupId = searchParams.get("group");
  const selectedAccumulatorId = searchParams.get("accumulator");
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

  const handleSelectAccumulator = useCallback(
    (accumulatorId: string) => {
      if (!selectedGroupId) return;
      const params: Record<string, string> = {
        group: selectedGroupId,
        accumulator: accumulatorId,
        lang: apiLanguage,
      };
      setSearchParams(params);
    },
    [apiLanguage, selectedGroupId, setSearchParams],
  );

  const handleBackToGroup = useCallback(() => {
    if (!selectedGroupId) return;
    setSearchParams(
      apiLanguage !== "en"
        ? { group: selectedGroupId, lang: apiLanguage }
        : { group: selectedGroupId },
    );
  }, [apiLanguage, selectedGroupId, setSearchParams]);

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
    if (selectedGroupId && selectedAccumulatorId) {
      return (
        <GroupAccumulatorDetailView
          groupAccumulatorId={selectedAccumulatorId}
          onBack={handleBackToGroup}
        />
      );
    }

    if (selectedGroupId) {
      return (
        <GroupDetailView
          groupId={selectedGroupId}
          apiLanguage={tolgeeApiLanguage}
          language={planLanguage}
          onBack={handleBackToList}
          onSelectAccumulator={handleSelectAccumulator}
        />
      );
    }

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
    selectedGroupId,
    selectedAccumulatorId,
    selectedSeriesId,
    selectedPlanId,
    selectedDate,
    planLanguage,
    tolgeeApiLanguage,
    isAuthenticatedReady,
    handleBackToList,
    handleBackToGroup,
    handleBackToSeries,
    handleDateChange,
    handleSelectSeries,
    handleSelectAccumulator,
  ]);

  return <div className="min-h-[calc(100dvh-4rem)] w-full">{content}</div>;
};

export default Planviewer;
