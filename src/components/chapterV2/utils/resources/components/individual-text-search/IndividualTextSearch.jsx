import React, { useState, useMemo } from 'react';
import { IoMdClose } from 'react-icons/io';
import { BiSearch } from 'react-icons/bi';
import { useTranslate } from '@tolgee/react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../../../../../../config/axios-config.js';
import PaginationComponent from '../../../../../commons/pagination/PaginationComponent.jsx';
import { highlightSearchMatch } from '../../../../../../utils/highlightUtils.jsx';
import { getLanguageClass, getEarlyReturn } from '../../../../../../utils/helperFunctions.jsx';
import { usePanelContext } from '../../../../../../context/PanelContext.jsx';
import './IndividualTextSearch.scss';
import PropTypes from "prop-types";
import { useDebounce } from 'use-debounce';

export const fetchTextSearchResults = async(query, textId, skip, pagination) => {
  const { data } = await axiosInstance.get(`api/v1/search?query=${query}&search_type=SOURCE&text_id=${textId}`, {
    params: {
      limit: pagination.limit,
      skip: skip
    }
  });
  return data;
};

const IndividualTextSearch = ({ onClose, textId: propTextId, handleSegmentNavigate }) => {
  const [searchParams] = useSearchParams();
  const textId = propTextId || searchParams.get("text_id");
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const { t } = useTranslate();
  const { openResourcesPanel } = usePanelContext();
  
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);
  
  const { data: searchResults, isLoading, error } = useQuery(
    ["textSearch", searchQuery, textId, skip, pagination],
    () => fetchTextSearchResults(searchQuery, textId, skip, pagination),
    {
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: !!(debouncedSearchQuery.trim() !== '' && textId)
    }
  );
  
  const searchText = searchResults?.search?.text || searchQuery;

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
      <div className="search-header">
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

    const source = searchResults.sources[0];
    const segments = source?.segment_match || [];
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

IndividualTextSearch.propTypes = {
  onClose: PropTypes.func.isRequired,
  textId: PropTypes.string,
  handleSegmentNavigate: PropTypes.func.isRequired,
};