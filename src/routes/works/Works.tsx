import { useMemo, useState } from 'react';
import axiosInstance from '../../config/axios-config.ts';
import { LANGUAGE, siteName } from "../../utils/constants.ts";
import { useTranslate } from '@tolgee/react';
import { useQuery } from 'react-query';
import { useParams, Link } from 'react-router-dom';
import {getEarlyReturn, getLanguageClass, mapLanguageCode} from "../../utils/helperFunctions.tsx";
import Seo from "../commons/seo/Seo.tsx";
import PaginationComponent from "../commons/pagination/PaginationComponent.tsx";
import Breadcrumbs from "../commons/breadcrumbs/Breadcrumbs.tsx";
import TwoColumnLayout from "../../components/layout/TwoColumnLayout";

const fetchWorks = async (bookId: string, limit = 10, skip = 0) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "en";

  const {data} = await axiosInstance.get("/api/v1/texts", {
    params: {
      language,
      collection_id: bookId,
      limit,
      skip
    }
  });
  return data;
};

type TextItem = {
  id: string;
  title: string;
  language: string;
};

const Works = () => {
  const {id: paramId} = useParams();
  const {t} = useTranslate();
  const id = paramId ?? "";

  const [pagination, setPagination] = useState<{ currentPage: number; limit: number }>({ currentPage: 1, limit: 12});
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);

  const {data: worksData, isLoading: worksDataIsLoading, error: worksDataIsError} = useQuery(
    ["works", id, skip, pagination.limit],
    () => fetchWorks(id, pagination.limit, skip),
    {refetchOnWindowFocus: false}
  );

  // ---------------------------------- helpers ----------------------------------

  const texts: TextItem[] = (worksData?.texts as TextItem[]) || [];

  const siteBaseUrl = window.location.origin;
  const canonicalUrl = `${siteBaseUrl}${window.location.pathname}`;
  const pageTitle = worksData?.collection?.title ? `${worksData.collection.title} | ${siteName}` : `Works | ${siteName}`;
  const earlyReturn = getEarlyReturn({ isLoading: worksDataIsLoading, error: worksDataIsError, t });
  if (earlyReturn) return earlyReturn;

  const totalPages = Math.ceil((worksData?.total || 0) / pagination.limit);
  const handlePageChange = (pageNumber: number) => {
    setPagination((prev: { currentPage: number; limit: number }) => ({ ...prev, currentPage: pageNumber }));
  };

  const rootTexts = texts;

  const breadcrumbItems = [
    { label: t('header.text'), path: '/' },
    { label: worksData?.collection?.title || '' }
  ];

  const handleTextClick = (text: TextItem) => {
    sessionStorage.setItem('textLanguage', text.language);
  };

  const getParentCollectionState = () => ({
    parentCollection: {
      id: id,
      title: worksData?.collection?.title
    }
  });

  const renderRootTexts = () => {  
    return (
      <div className="space-y-2">
        {rootTexts.length !== 0 && (
          <>
        <h1 className="text-xl font-semibold tracking-wide text-gray-700">
        {worksData?.collection?.title}
         </h1>
            <div className="grid grid-cols-1 gap-6 pr-0 sm:grid-cols-2 lg:grid-cols-2 md:gap-8">
              {rootTexts.map((text) =>
                  <Link
                  onClick={() => handleTextClick(text)}
                  key={text.id}
                  to={`/texts/${text.id}?type=root_text`}
                  state={getParentCollectionState()}
                  className={`${getLanguageClass(text.language)} flex flex-col gap-2 text-left text-gray-800 transition-colors hover:text-gray-600`}
                >
                  <p className="text-lg pt-4 border-t">{text.title}</p>
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <TwoColumnLayout
      main={
        <div className="mx-auto flex w-full max-w-2xl flex-col pt-10">
        <div className="flex w-full flex-col space-y-4 text-left">
          <Seo
            title={pageTitle}
            description="Browse texts within this collection."
            canonical={canonicalUrl}
          />
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="overalltext text-left text-2xl font-semibold text-gray-700">{worksData.term?.title}</h1>
          {renderRootTexts()}
          <PaginationComponent
            pagination={pagination}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            setPagination={setPagination}
          />
        </div>
        </div>
      }
      sidebar={<div className="h-full w-full" />}
    />
  );

};

export default Works;