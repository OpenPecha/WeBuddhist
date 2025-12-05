import React, { useState, useMemo } from 'react';
import { IoMdClose } from 'react-icons/io';
import { IoChevronBackSharp } from "react-icons/io5";
import { BiSearch } from 'react-icons/bi';
import { useTranslate } from '@tolgee/react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../../../../../../config/axios-config.ts';
import PaginationComponent from '../../../../../commons/pagination/PaginationComponent.tsx';
import { highlightSearchMatch } from '../../../../../../utils/highlightUtils.tsx';
import { getLanguageClass, getEarlyReturn, mapLanguageCode } from '../../../../../../utils/helperFunctions.tsx';
import { usePanelContext } from '../../../../../../context/PanelContext.tsx';
import './IndividualTextSearch.scss';
import { useDebounce } from 'use-debounce';
import { LANGUAGE } from '../../../../../../utils/constants.ts';

export const fetchTextSearchResults = async(query, textId, language, skip, pagination) => {
  const { data } = await axiosInstance.get('api/v1/search/multilingual', {
    params: {
      query,
      search_type: 'exact',
      text_id: textId,
      language,
      limit: pagination.limit,
      skip: skip
    }
  });
  return data;
};

const IndividualTextSearch = ({ onClose, textId: propTextId, handleSegmentNavigate, handleNavigate }) => {
  const [searchParams] = useSearchParams();
  const textId = propTextId || searchParams.get("text_id");
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const { t } = useTranslate();
  const { openResourcesPanel } = usePanelContext();
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : 'en';
  
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);
  
  const { data: searchResults, isLoading, error } = useQuery(
    ["textSearch", debouncedSearchQuery, textId, language, skip, pagination],
    () => fetchTextSearchResults(debouncedSearchQuery, textId, language, skip, pagination),
    {
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: !!(debouncedSearchQuery.trim() !== '' && textId)
    }
  );
  
  const searchText = searchResults?.query || searchQuery;

  // ----------------------------- helpers ---------------------------------------

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }
  };
  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, currentPage: pageNumber }));
  };

  const earlyReturn = getEarlyReturn({ isLoading, error, t });
  
  // ----------------------------- renderers -------------------------------------
  const renderHeader = () => {
    return (
      <div className="search-header mt-2">
        <IoChevronBackSharp size={24} onClick={() => handleNavigate()} className="back-icon" />
        <h2>{t('connection_panel.search_in_this_text')}</h2>
        <IoMdClose
          size={24}
          onClick={onClose}
          className="close-icon"
        />
      </div>
    );
  };

  const renderSearchForm = () => {
    return (
      <div className="search-container">
        <form onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <BiSearch className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('connection_panel.search_in_this_text')}
              className="search-input"
              autoFocus
            />
          </div>
        </form>
      </div>
    );
  };

  const renderSegmentsList = (segments, source) => {
    return (
      <div className="segments-list">
        {segments.map((segment) => (
          <button 
            type="button" 
            key={segment.segment_id} 
            onClick={() => {
              handleSegmentNavigate(segment.segment_id);
              openResourcesPanel();
            }}
            className={`segment-item ${getLanguageClass(source.text.language)}`}>
            <p dangerouslySetInnerHTML={{__html: highlightSearchMatch(segment.content, searchText, 'highlighted-text')}} />
          </button>
        ))}
      </div>
    );
  };

  const renderPagination = (totalSegments) => {
    const totalPages = Math.ceil(totalSegments / pagination.limit);
    
    if (totalPages <= 1) {
      return null;
    }
    
    return (
      <PaginationComponent
        pagination={pagination}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        setPagination={setPagination}
      />
    );
  };

  const renderSearchResults = () => {
    if (!debouncedSearchQuery || debouncedSearchQuery.trim() === '') {
      return null;
    }

    if (earlyReturn) return earlyReturn;

    if (!searchResults?.sources || searchResults.sources.length === 0) {
      return <div className="search-message">{t('search.zero_result', 'No results to display.')}</div>;
    }

    const source = searchResults.sources?.[0];
    const segments = source?.segment_matches || [];
    const totalSegments = segments.length;

    return (
      <div className="search-results">
        <div className="results-count">
          <p>{t("sheet.search.total")} : {searchResults.total}</p>
        </div>
        {renderSegmentsList(segments, source)}
        {renderPagination(totalSegments)}
      </div>
    );
  };

  return (
    <div className="individual-text-search ">
      {renderHeader()}
      {renderSearchForm()}
      {renderSearchResults()}
    </div>
  );
};

export default IndividualTextSearch;