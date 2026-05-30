import axiosInstance from "@/config/axios-config";
import { LANGUAGE } from "@/utils/constants";
import { mapLanguageCode } from "@/utils/helperFunctions";

export type PlanImage = {
  thumbnail?: string;
  medium?: string;
  original?: string;
};

export type Plan = {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty_level: string;
  image: PlanImage | null;
  total_days: number;
  tags: { id: string; name: string }[];
  author?: {
    firstname?: string;
    lastname?: string;
  };
  start_date?: string;
  display_order?: number;
};

export type PlansResponse = {
  plans: Plan[];
  skip: number;
  limit: number;
  total: number;
};

export const HOME_PLANS_LIMIT = 3;
export const HOME_SERIES_LIMIT = 2;
export const PLANS_PAGE_LIMIT = 20;
export const SERIES_PAGE_LIMIT = 10;

export const getPlannerLanguage = () => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  return storedLanguage ? mapLanguageCode(storedLanguage) : "en";
};

export const fetchPlans = async (
  skip = 0,
  limit = PLANS_PAGE_LIMIT,
): Promise<PlansResponse> => {
  const language = getPlannerLanguage();
  const { data } = await axiosInstance.get<PlansResponse>("/api/v1/plans", {
    params: {
      language,
      sort_by: "title",
      sort_order: "asc",
      skip,
      limit,
    },
  });
  return data;
};

export const formatPlanAuthorName = (author?: Plan["author"]) =>
  [author?.firstname, author?.lastname].filter(Boolean).join(" ");

export type SeriesMetadata = {
  id: string;
  title: string;
  description: string;
  language: string;
};

export type Series = {
  id: string;
  metadata: SeriesMetadata[];
  image: string | null;
  image_key?: string;
  author_id?: string;
  featured: boolean;
  status: string;
  plan_count: number;
  total_days: number;
};

export type SeriesResponse = {
  series: Series[];
  skip: number;
  limit: number;
  total: number;
};

export const getSeriesMetadata = (item: Series, language: string) => {
  const code = language.toUpperCase();
  return (
    item.metadata.find((m) => m.language.toUpperCase() === code) ??
    item.metadata[0]
  );
};

export const fetchSeries = async (
  skip = 0,
  limit = SERIES_PAGE_LIMIT,
): Promise<SeriesResponse> => {
  const { data } = await axiosInstance.get<SeriesResponse>("/api/v1/series", {
    params: {
      skip,
      limit,
    },
  });
  return data;
};
