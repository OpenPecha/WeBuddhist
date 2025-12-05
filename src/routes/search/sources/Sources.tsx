import React, { useMemo, useState } from 'react';
import { useTranslate } from '@tolgee/react';
import './Sources.scss';
import axiosInstance from '../../../config/axios-config.js';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import PaginationComponent from '../../commons/pagination/PaginationComponent.tsx';
import { highlightSearchMatch } from '../../../utils/highlightUtils.tsx';
import {getLanguageClass, mapLanguageCode} from "../../../utils/helperFunctions.tsx";
import { LANGUAGE } from "../../../utils/constants.ts";


export const fetchSources = async(query: string, language: string, skip: number, pagination: any) => {

  const {data} = await axiosInstance.get('api/v1/search/multilingual', {
    params: {
      query,
      search_type: 'exact',
      language,
      limit: pagination.limit,
      skip: skip
    }
  });
  return data;
  
}

const Sources = (query: any) => {
  const { t } = useTranslate();
  const stringq = query?.query;
  const navigate = useNavigate();
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "en";

   const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
    const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);
    const {data:sourceData,isLoading,error}=useQuery(
      ["sources",stringq,language,skip,pagination],
      ()=>fetchSources(stringq,language,skip,pagination),
      {
        refetchOnWindowFocus:false,
        retry:1
      }
    )
    const searchText = sourceData?.query || stringq;

    if (isLoading) return <div className="listsubtitle">{t("common.loading")}</div>;
  
    if (error) {
      if(error.response?.status ===404){
        return <div className="listtitle">{t('search.zero_result', 'No results to display.')}</div>;
      }
      return <div className="listtitle">Error loading content: {error.message}</div>;
    }
    if (!sourceData?.sources || sourceData.sources.length === 0) {
      return <div className="listtitle">{t('search.zero_result', 'No results to display.')}</div>;
    }
    const totalVersions = sourceData.sources?.length || 0;
  const totalPages = Math.ceil(totalVersions / pagination.limit);
  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, currentPage: pageNumber }));
  };
  return (
    <div className="sources-tab">
    <div className="results-count">
      <p> {t("sheet.search.total")} : {sourceData.total}</p>
    </div>
    {sourceData.sources.map((source) => (
      <div key={source.text.text_id} className={`source-item ${getLanguageClass(source.text.language)}`}>
        <h4>{source.text.title}</h4>
        <span className='en-text'>{source.text.published_date}</span>
        <div className="segments">
          {source.segment_matches.map((segment) => (
            <button type="button" key={segment.segment_id} className="segment" 
            onClick={() => {
              if (segment.segment_id && source.text?.text_id) {
                navigate(`/chapter?text_id=${source.text.text_id}&segment_id=${segment.segment_id}&versionId=`);
              }
            }}
            >
              <p dangerouslySetInnerHTML={{__html : highlightSearchMatch(segment.content, searchText, 'highlighted-text')}} />
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