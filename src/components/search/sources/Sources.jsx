import React, { useMemo, useState } from 'react';
import { useTranslate } from '@tolgee/react';
import './Sources.scss';
import { getLanguageClass,mapLanguageCode,LANGUAGE } from '../../../utils/Constants';
import axiosInstance from '../../../config/axios-config';
import { useQuery } from 'react-query';
import PaginationComponent from '../../commons/pagination/PaginationComponent';


export const fetchSources = async(query, skip, pagination) => {
  const storedLanguage = localStorage.getItem(LANGUAGE)
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo")
  const {data} = await axiosInstance.get(`api/v1/search/sheet?search=${query}`, {
    params: {
      language,
      limit: pagination.limit,
      skip: skip
    }
  })
  return data;
  
}

const Sources = (query) => {
  const { t } = useTranslate();
   const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
    const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);
    const {data:sourceData,isLoading,error}=useQuery(
      ["sources",query,skip,pagination],
      ()=>fetchSources(query,skip,pagination),
      {
        refetchOnWindowFocus:false,
        retry:1
      }
    )
    if (isLoading) return <div className="listsubtitle">{t("common.loading")}</div>;
  
    if (error) return <div className="no-content listtitle">Error loading content: {error.message}</div>;
  
    if (!sourceData || !sourceData.data || sourceData.data.length === 0) {
      return <div className="no-content listtitle">{t('search.zero_result', 'No results to display.')}</div>;
    }
    const totalVersions = sourceData.data.result?.length || 0;
  const totalPages = Math.ceil(totalVersions / pagination.limit);
  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, currentPage: pageNumber }));
  };

  return (
    <div className="sources-tab">
    <div className="results-count">
      <p>Total :</p>
    </div>
    {sourceData.data.result.map((source) => (
      <div key={source.text.text_id} className={`source-item ${getLanguageClass(source.text.language)}`}>
        <h4>{source.text.title}</h4>
        <span className='en-text'>{source.text.published_date}</span>
        <div className="segments">
          {source.segment_match.map((segment) => (
            <div key={segment.segment_id} className="segment">
              <p>{segment.content}</p>
            </div>
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