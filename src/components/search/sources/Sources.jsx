import React, { useMemo, useState } from 'react';
import { useTranslate } from '@tolgee/react';
import './Sources.scss';
import { getLanguageClass } from '../../../utils/Constants';
import axiosInstance from '../../../config/axios-config';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import PaginationComponent from '../../commons/pagination/PaginationComponent';
import { highlightSearchMatch } from '../../../utils/highlightUtils.jsx';


export const fetchSources = async(query, skip, pagination) => {

  const {data} = await axiosInstance.get(`api/v1/search?query=${query}&type=${'source'}`, {
    params: {
      limit: pagination.limit,
      skip: skip
    }
  })
  return data;
  
}

const Sources = (query) => {
  const { t } = useTranslate();
  const stringq = query?.query;
  const navigate = useNavigate();

   const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
    const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);
    const {data:sourceData,isLoading,error}=useQuery(
      ["sources",stringq,skip,pagination],
      ()=>fetchSources(stringq,skip,pagination),
      {
        refetchOnWindowFocus:false,
        retry:1
      }
    )
    const searchText = sourceData?.search?.text || stringq;

    if (isLoading) return <div className="listsubtitle">{t("common.loading")}</div>;
  
    if (error) {
      if(error.response?.status ===404){
        return <div className="listtitle">{t('search.zero_result', 'No results to display.')}</div>;
      }
      return <div className="listtitle">Error loading content: {error.message}</div>;
    }
    if (!sourceData || !sourceData.sources || sourceData.sources.length === 0) {
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
      <p>Total :</p>
    </div>
    {sourceData.sources.map((source) => (
      <div key={source.text.text_id} className={`source-item ${getLanguageClass(source.text.language)}`}>
        <h4>{source.text.title}</h4>
        <span className='en-text'>{source.text.published_date}</span>
        <div className="segments">
          {source.segment_match.map((segment) => (
            <div key={segment.segment_id} className="segment" 
            onClick={() => {
              if (segment.segment_id && source.text?.text_id) {
                navigate(`/texts/text-details?textId=${source.text.text_id}&segmentId=${segment.segment_id}`);
              }
            }}
            >
              <p dangerouslySetInnerHTML={{__html : highlightSearchMatch(segment.content, searchText, 'highlighted-text')}} />
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