import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTolgee } from "@tolgee/react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "../../config/AuthContext.tsx";
import { LANGUAGE } from "../../utils/constants.ts";
import { mapLanguageCode } from "../../utils/helperFunctions.tsx";
import SeriesListView from "./components/SeriesListView.tsx";
import SeriesDetailView from "./components/SeriesDetailView.tsx";
import SeriesPlanRedirect from "./components/SeriesPlanRedirect.tsx";
import DailyPlanView from "./components/DailyPlanView.tsx";
import GroupDetailView from "../mantras/components/GroupDetailView.tsx";
import GroupAccumulatorDetailView from "../mantras/components/GroupAccumulatorDetailView.tsx";
import JoinableGroupsListView from "../mantras/components/JoinableGroupsListView.tsx";
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
  const seriesView = searchParams.get("view");
  const showGroupsList = seriesView === "groups";
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

  const handleViewSeriesPlans = useCallback(
    (seriesId: string) => {
      setSearchParams({ series: seriesId, view: "list", lang: apiLanguage });
    },
    [apiLanguage, setSearchParams],
  );

  const handleSelectPlan = useCallback(
    (planId: string, date?: string) => {
      if (!selectedSeriesId) return;
      const params: Record<string, string> = {
        series: selectedSeriesId,
        plan: planId,
        lang: apiLanguage,
      };
      if (date) params.date = date;
      setSearchParams(params);
    },
    [apiLanguage, selectedSeriesId, setSearchParams],
  );

  const handleBackToList = useCallback(() => {
    setSearchParams(apiLanguage !== "en" ? { lang: apiLanguage } : {});
  }, [apiLanguage, setSearchParams]);

  const handleViewAllGroups = useCallback(() => {
    setSearchParams({ view: "groups", lang: apiLanguage });
  }, [apiLanguage, setSearchParams]);

  const handleBackToSeries = useCallback(() => {
    if (selectedSeriesId) {
      setSearchParams({
        series: selectedSeriesId,
        view: "list",
        lang: apiLanguage,
      });
      return;
    }
    setSearchParams(apiLanguage !== "en" ? { lang: apiLanguage } : {});
  }, [apiLanguage, selectedSeriesId, setSearchParams]);

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

    if (selectedSeriesId && seriesView === "list") {
      return (
        <SeriesDetailView
          seriesId={selectedSeriesId}
          language={planLanguage}
          apiLanguage={tolgeeApiLanguage}
          isAuthenticated={isAuthenticatedReady}
          onBack={handleBackToList}
          onSelectPlan={handleSelectPlan}
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

    if (showGroupsList) {
      return (
        <JoinableGroupsListView
          apiLanguage={tolgeeApiLanguage}
          language={planLanguage}
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
        onViewSeriesPlans={handleViewSeriesPlans}
        onViewAllGroups={handleViewAllGroups}
      />
    );
  }, [
    selectedGroupId,
    selectedAccumulatorId,
    selectedSeriesId,
    selectedPlanId,
    selectedDate,
    seriesView,
    planLanguage,
    tolgeeApiLanguage,
    apiLanguage,
    isAuthenticatedReady,
    handleBackToList,
    handleBackToGroup,
    handleBackToSeries,
    handleDateChange,
    handleSelectSeries,
    handleSelectAccumulator,
    handleViewSeriesPlans,
    handleSelectPlan,
    showGroupsList,
    handleViewAllGroups,
  ]);

  return <div className="min-h-[calc(100dvh-4rem)] w-full">{content}</div>;
};

export default Planviewer;
