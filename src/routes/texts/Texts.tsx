import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import {
  getLanguageClass,
  mapLanguageCode,
} from "../../utils/helperFunctions.tsx";
import Seo from "../commons/seo/Seo.tsx";
import { siteName } from "../../utils/constants.ts";
import axiosInstance from "../../config/axios-config.ts";
import { useTranslate } from "@tolgee/react";
import { useParams, useLocation, Link } from "react-router-dom";
import Versions from "./versions/Versions.tsx";
import Commentaries from "./commentaries/Commentaries.tsx";
import Breadcrumbs, {
  type BreadcrumbItemType,
} from "../commons/breadcrumbs/Breadcrumbs.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TwoColumnLayout from "../../components/layout/TwoColumnLayout";

export const fetchTableOfContents = async (
  textId: string,
  skip: number,
  limit: number,
) => {
  const language = sessionStorage.getItem("textLanguage");
  const mappedLanguage = language ? mapLanguageCode(language) : "en";
  const { data } = await axiosInstance.get(`/api/v1/texts/${textId}/contents`, {
    params: {
      language: mappedLanguage,
      limit: limit,
      skip: skip,
    },
  });
  return data;
};

export const fetchVersions = async (
  textId: string,
  skip: number,
  limit: number,
) => {
  const language = sessionStorage.getItem("textLanguage");
  const mappedLanguage = language ? mapLanguageCode(language) : "en";
  const { data } = await axiosInstance.get(`/api/v1/texts/${textId}/versions`, {
    params: {
      language: mappedLanguage,
      limit,
      skip,
    },
  });
  return data;
};

export const fetchCommentaries = async (
  textId: string,
  skip: number,
  limit: number,
) => {
  const { data } = await axiosInstance.get(
    `/api/v1/texts/${textId}/commentaries`,
    {
      params: {
        skip,
        limit,
      },
    },
  );
  return { items: data };
};

const Texts = (props: any) => {
  const {
    collection_id,
    addChapter,
    currentChapter,
    isCompactView = false,
  } = props || {};
  const { t } = useTranslate();
  const { id: urlId } = useParams();
  const location = useLocation();
  const textId = collection_id || urlId || "";
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const [versionsPagination] = useState({ currentPage: 1, limit: 10 });
  const [commentariesPagination, setCommentariesPagination] = useState({
    currentPage: 1,
    limit: 10,
  });
  const skip = useMemo(
    () => (pagination?.currentPage - 1) * pagination?.limit,
    [pagination],
  );
  const versionsSkip = useMemo(
    () => (versionsPagination?.currentPage - 1) * versionsPagination?.limit,
    [versionsPagination],
  );
  const commentariesSkip = useMemo(
    () =>
      (commentariesPagination?.currentPage - 1) * commentariesPagination?.limit,
    [commentariesPagination],
  );

  const { data: tableOfContents } = useQuery(
    ["table-of-contents", textId, skip, pagination.limit],
    () => fetchTableOfContents(textId, skip, pagination.limit),
    { refetchOnWindowFocus: false, enabled: !!textId, retry: false },
  );

  const {
    data: versions,
    isLoading: versionsIsLoading,
    error: versionsIsError,
  } = useQuery(
    ["versions", textId, versionsSkip, versionsPagination.limit],
    () => fetchVersions(textId, versionsSkip, versionsPagination.limit),
    { refetchOnWindowFocus: false, enabled: !!textId },
  );

  const {
    data: commentaries,
    isLoading: commentariesIsLoading,
    error: commentariesIsError,
  } = useQuery(
    ["commentaries", textId, commentariesSkip, commentariesPagination.limit],
    () =>
      fetchCommentaries(textId, commentariesSkip, commentariesPagination.limit),
    { refetchOnWindowFocus: false, enabled: !!textId, retry: false },
  );

  const siteBaseUrl = window.location.origin;
  const canonicalUrl = `${siteBaseUrl}${window.location.pathname}`;
  const dynamicTitle = versions?.text?.title
    ? `${versions.text.title} | ${siteName}`
    : `Text | ${siteName}`;
  const description =
    "Read Buddhist texts with translations and related resources.";

  const parentCollection = location.state?.parentCollection || null;

  const breadcrumbItems: BreadcrumbItemType[] = useMemo(() => {
    const items: BreadcrumbItemType[] = [
      { label: t("header.text"), path: "/" },
    ];
    if (parentCollection?.title) {
      items.push({
        label: parentCollection.title,
        path: `/works/${parentCollection.id}`,
      });
    }
    if (versions?.text?.title) {
      items.push({ label: versions.text.title });
    }
    return items;
  }, [parentCollection, versions?.text?.title, t]);

  const renderTabs = () => {
    return (
      <Tabs className="w-full space-y-4" defaultValue="versions">
        <TabsList className="overalltext">
          <TabsTrigger value="versions">{t("common.version")}</TabsTrigger>
          {commentaries?.items.length > 0 && (
            <TabsTrigger value="commentaries">
              {t("text.type.commentary")}
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="versions">
          <Versions
            contentId={tableOfContents?.contents[0]?.id}
            versions={versions}
            versionsIsLoading={versionsIsLoading}
            versionsIsError={versionsIsError}
            addChapter={addChapter}
            currentChapter={currentChapter}
          />
        </TabsContent>
        <TabsContent value="commentaries" className="mt-2">
          <Commentaries
            textId={textId}
            items={commentaries?.items || []}
            isLoading={commentariesIsLoading}
            isError={commentariesIsError}
            pagination={commentariesPagination}
            setPagination={setCommentariesPagination}
            addChapter={addChapter}
            currentChapter={currentChapter}
          />
        </TabsContent>
      </Tabs>
    );
  };

  const handleTextTitleClick = (e: React.MouseEvent) => {
    if (addChapter && tableOfContents?.contents[0]?.id) {
      e.preventDefault();
      const chapterData = {
        textId: textId,
        contentId: tableOfContents.contents[0].id,
      };
      addChapter(chapterData, currentChapter);
    }
  };

  if (isCompactView) {
    return (
      <div className="space-y-4 p-4">
        {addChapter ? (
          <button
            type="button"
            onClick={handleTextTitleClick}
            className="text-left cursor-pointer hover:opacity-80 transition-opacity"
          >
            <h1
              className={`text-gray-800 text-lg ${getLanguageClass(versions?.text?.language)}`}
            >
              {versions?.text?.title}
            </h1>
          </button>
        ) : (
          <Link
            to={`/chapter?text_id=${textId}&content_id=${tableOfContents?.contents[0]?.id}&versionId=&contentIndex=${0}`}
            className="text-left"
          >
            <h1
              className={`text-gray-800 ${getLanguageClass(versions?.text?.language)}`}
            >
              {versions?.text?.title}
            </h1>
          </Link>
        )}
        {renderTabs()}
      </div>
    );
  }

  return (
    <TwoColumnLayout
      main={
        <div className="mx-auto flex w-full max-w-2xl flex-col pt-10">
          <div className="flex w-full flex-col space-y-6 text-left">
            <Seo
              title={dynamicTitle}
              description={description}
              canonical={canonicalUrl}
            />
            <Breadcrumbs items={breadcrumbItems} />
            <Link
              to={`/chapter?text_id=${textId}&content_id=${tableOfContents?.contents[0]?.id}&versionId=&contentIndex=${0}`}
              className="text-left"
            >
              <p
                className={`text-gray-800 text-lg ${getLanguageClass(versions?.text?.language)}`}
              >
                {versions?.text?.title}
              </p>
            </Link>
            {renderTabs()}
          </div>
        </div>
      }
      sidebar={<div className="h-full w-full" />}
    />
  );
};

export default Texts;
