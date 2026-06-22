import axios from "axios";
import axiosInstance from "../../../config/axios-config.ts";
import type {
  DailyPlanResponse,
  SeriesDTO,
  SeriesListResponse,
  UserPlanDayCompletionStatusResponse,
  UserSeriesEnrollmentsResponse,
  VerseOfDayPublicResponse,
} from "../types.ts";

export async function fetchVerseOfDayToday(
  lang: string,
): Promise<VerseOfDayPublicResponse> {
  const { data } = await axiosInstance.get<VerseOfDayPublicResponse>(
    "/api/v1/verse-of-day/today",
    { params: { lang } },
  );
  return data;
}

export async function fetchPublicSeries(
  language: string,
  limit = 50,
): Promise<SeriesListResponse> {
  const { data } = await axiosInstance.get<SeriesListResponse>(
    "/api/v1/series",
    { params: { language, limit, skip: 0 } },
  );
  return data;
}

export async function fetchFeaturedSeries(
  language: string,
  limit = 20,
): Promise<SeriesListResponse> {
  return fetchPublicSeries(language, limit);
}

export async function fetchSeriesDetail(
  seriesId: string,
  language: string,
): Promise<SeriesDTO> {
  const { data } = await axiosInstance.get<SeriesDTO>(
    `/api/v1/series/${seriesId}`,
    { params: { language } },
  );
  return data;
}

export async function fetchUserSeriesEnrollments(
  language: string,
): Promise<UserSeriesEnrollmentsResponse> {
  const { data } = await axiosInstance.get<UserSeriesEnrollmentsResponse>(
    "/api/v1/users/me/series",
    { params: { language, limit: 50 } },
  );
  return data;
}

export async function enrollInSeries(seriesId: string): Promise<void> {
  await axiosInstance.post("/api/v1/users/me/series", {
    series_id: seriesId,
    auto_enroll_next: true,
    start_immediately: true,
  });
}

export async function fetchPlanDaily(
  planId: string,
  language: string,
  date?: string,
): Promise<DailyPlanResponse> {
  const { data } = await axiosInstance.get<DailyPlanResponse>(
    `/api/v1/plans/${planId}/daily`,
    { params: { language, ...(date ? { date } : {}) } },
  );
  return data;
}

export async function fetchPlanDayCompletionStatus(
  planId: string,
): Promise<UserPlanDayCompletionStatusResponse | null> {
  try {
    const { data } =
      await axiosInstance.get<UserPlanDayCompletionStatusResponse>(
        `/api/v1/users/me/plans/${planId}/days/completion_status`,
      );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
