import { useMemo, useState } from "react";
import { useTranslate } from "@tolgee/react";
import axiosInstance from "../../../config/axios-config.js";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../../commons/pagination/PaginationComponent.tsx";
import { highlightSearchMatch } from "../../../utils/highlightUtils.tsx";
import {
  getLanguageClass,
  mapLanguageCode,
} from "../../../utils/helperFunctions.tsx";
import { LANGUAGE } from "../../../utils/constants.ts";

type SegmentMatch = {
  segment_id: string;
  content: string;
};

type SourceText = {
  text_id: string;
  title: string;
  published_date: string;
  language: string;
};

type SourceItem = {
  text: SourceText;
  segment_matches: SegmentMatch[];
};

type SourceResponse = {
  query: string;
  total: number;
  sources: SourceItem[];
};

export const fetchSources = async (
  query: string,
  language: string,
  skip: number,
  pagination: { limit: number },
): Promise<SourceResponse> => {
  const { data } = await axiosInstance.get("api/v1/search/multilingual", {
    params: {
      query,
      search_type: "exact",
      language,
      limit: pagination.limit,
      skip: skip,
    },
  });
  return data;
};

const Sources = (query: any) => {
  const { t } = useTranslate();
  const stringq = query?.query;
  const navigate = useNavigate();
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "en";

  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(
    () => (pagination.currentPage - 1) * pagination.limit,
    [pagination],
  );
  const {
    data: sourceData,
    isLoading,
    error,
  } = useQuery<SourceResponse, any>(
    ["sources", stringq, language, skip, pagination],
    () => fetchSources(stringq, language, skip, pagination),
    {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );
  const searchText = sourceData?.query || stringq;

  if (isLoading)
    return <div className="listsubtitle">{t("common.loading")}</div>;

  if (error) {
    if (error.response?.status === 404) {
      return (
        <div className="listtitle">
          {t("search.zero_result", "No results to display.")}
        </div>
      );
    }
    return (
      <div className="listtitle">Error loading content: {error.message}</div>
    );
  }
  if (!sourceData?.sources || sourceData.sources.length === 0) {
    return (
      <div className="listtitle">
        {t("search.zero_result", "No results to display.")}
      </div>
    );
  }
  const totalVersions = sourceData.sources?.length || 0;
  const totalPages = Math.ceil(totalVersions / pagination.limit);
  const handlePageChange = (pageNumber: number) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }));
  };
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">
        <p>
          {t("sheet.search.total")} : {sourceData.total}
        </p>
      </div>

      {sourceData.sources.map((source: SourceItem) => (
        <div
          key={source.text.text_id}
          className={`mb-4 space-y-2 ${getLanguageClass(source.text.language)}`}
        >
          <h4 className="text-lg font-semibold text-gray-900">
            {source.text.title}
          </h4>
          <span className="block text-sm text-gray-500">
            {source.text.published_date}
          </span>

          <div className="flex flex-col space-y-3.5">
            {source.segment_matches.map((segment: SegmentMatch) => (
              <button
                type="button"
                key={segment.segment_id}
                className="relative border-0 bg-transparent pl-4 text-justify cursor-pointer before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-full before:bg-[hsl(9,82%,36%)] before:content-[''] hover:bg-gray-50 [&_.highlighted-text]:bg-yellow-300 [&_.highlighted-text]:px-0.5"
                onClick={() => {
                  if (segment.segment_id && source.text?.text_id) {
                    navigate(
                      `/chapter?text_id=${source.text.text_id}&segment_id=${segment.segment_id}&versionId=`,
                    );
                  }
                }}
              >
                <p
                  className="m-0 text-base leading-relaxed text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchMatch(
                      segment.content,
                      searchText,
                      "highlighted-text",
                    ),
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      ))}

      <PaginationComponent
        pagination={pagination}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        setPagination={setPagination}
      />
    </div>
  );
};

export default Sources;
