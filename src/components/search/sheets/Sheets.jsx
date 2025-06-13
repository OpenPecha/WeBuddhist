import React, { useState, useMemo } from 'react';
import { useTranslate } from '@tolgee/react';
import './Sheets.scss';
import { CiBookmark } from 'react-icons/ci';
import axiosInstance from '../../../config/axios-config';
import { useQuery } from 'react-query';
import PaginationComponent from '../../commons/pagination/PaginationComponent';
import { highlightSearchMatch } from '../../../utils/highlightUtils.jsx';

export const fetchSheets = async(query, skip, pagination) => {
  const {data} = await axiosInstance.get(`api/v1/search?query=${query}&search_type=${'SHEET'}`, {
    params: {
      limit: pagination.limit,
      skip: skip
    }
  })
  return data;
}

const Sheets = (query) => {
  const { t } = useTranslate();
  const stringq = query?.query;
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);

  const {data: sheetData, isLoading, error} = useQuery(
    ["sheets", stringq, skip, pagination],
    () => fetchSheets(stringq, skip, pagination),
    {
      refetchOnWindowFocus: false,
      retry: 1
    }
  )
  const searchText = sheetData?.search?.text || stringq;

  if (isLoading) return <div className="listsubtitle">{t("common.loading")}</div>;

  if (error) {
    if(error.response?.status === 404){
      return <div className="listtitle">{t('search.zero_result', 'No results to display.')}</div>;
    }
    return <div className="listtitle">Error loading content: {error.message}</div>;
  }

  if (!sheetData || !sheetData.sheets || sheetData.sheets.length === 0) {
    return <div className="listtitle">{t('search.zero_result', 'No results to display.')}</div>;
  }
  const totalVersions = sheetData.sheets?.length || 0;
  const totalPages = Math.ceil(totalVersions / pagination.limit);
  
  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, currentPage: pageNumber }));
  };
  
  return (
    <div className="sheets-tab">
      <p className="results-count">
        {t("sheet.search.total")} : {totalVersions}
      </p>
      {sheetData.sheets.map((sheet) => (
        <div key={sheet.sheet_id} className="sheet-result-item">
          <div className="sheet-header">
          <h3 className="sheet-title">{sheet.sheet_title}</h3>
          <CiBookmark className="bookmark-icon"/>
          </div>
          <p className="sheet-summary">{highlightSearchMatch(sheet.sheet_summary, searchText, 'highlighted-text')}</p>
          <div className="publisher-info">
          <a href={sheet.publisher_url} className="publisher-link">
              {sheet.publisher_image ? (
                <img 
                  src={sheet.publisher_image} 
                  alt={sheet.publisher_name}
                  className="publisher-image"
                />
              ) : (
                <div className="publisher-initials">
                  {sheet.publisher_name.split(' ').map(name => name[0]).join('').substring(0, 2)}
                </div>
              )}
                <span className="publisher-name">{sheet.publisher_name}</span>
                </a>
                <span className="publisher-organization">{sheet.publisher_organization}</span>
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

export default Sheets;