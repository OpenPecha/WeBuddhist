import React, { useState, useMemo } from 'react';
import { IoMdClose } from 'react-icons/io';
import { BiSearch } from 'react-icons/bi';
import { useTranslate } from '@tolgee/react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../../../../../../config/axios-config.js';
import PaginationComponent from '../../../../../commons/pagination/PaginationComponent.jsx';
import { highlightSearchMatch } from '../../../../../../utils/highlightUtils.jsx';
import { getLanguageClass } from '../../../../../../utils/helperFunctions.jsx';
import { usePanelContext } from '../../../../../../context/PanelContext.jsx';
import './IndividualTextSearch.scss';
import PropTypes from "prop-types";

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
  const [isSearchSubmitted, setIsSearchSubmitted] = useState(false);
  const { t } = useTranslate();
  const { closeResourcesPanel } = usePanelContext();
  
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);
  
  const { data: searchResults, isLoading, error } = useQuery(
    ["textSearch", searchQuery, textId, skip, pagination],
    () => fetchTextSearchResults(searchQuery, textId, skip, pagination),
    {
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: !!(isSearchSubmitted && searchQuery.trim() !== '' && textId)
    }
  );
  
  const searchText = searchResults?.search?.text || searchQuery;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      setIsSearchSubmitted(true);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }
  };

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, currentPage: pageNumber }));
  };

  const renderSearchResults = () => {
    if (!isSearchSubmitted) {
      return null;
    }

    if (isLoading) {
      return <div className="search-message">{t("common.loading")}</div>;
    }

    if (error) {
      if (error.response?.status === 404) {
        return <div className="search-message">{t('search.zero_result', 'No results to display.')}</div>;
      }
      return <div className="search-message">Error loading content: {error.message}</div>;
    }

    if (!searchResults?.sources || searchResults.sources.length === 0) {
      return <div className="search-message">{t('search.zero_result', 'No results to display.')}</div>;
    }

    const source = searchResults.sources[0];
    const segments = source?.segment_match || [];
    const totalSegments = segments.length;
    const totalPages = Math.ceil(totalSegments / pagination.limit);

    return (
      <>
        <div className="results-count">
        </div>
        <div className="segments-list">
          {segments.map((segment) => (
            <button 
              type="button" 
              key={segment.segment_id} 
              onClick={() => {
                handleSegmentNavigate(segment.segment_id);
                closeResourcesPanel();
              }}
              className={`segment-item ${getLanguageClass(source.text.language)}`}>
              <p dangerouslySetInnerHTML={{__html: highlightSearchMatch(segment.content, searchText, 'highlighted-text')}} />
            </button>
          ))}
        </div>
          <PaginationComponent
            pagination={pagination}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            setPagination={setPagination}
          />
      </>
    );
  };

  return (
    <div className="individual-text-search">
      <div className="search-header">
        <h2>{t('connection_panel.search_in_this_text')}</h2>
        <IoMdClose
          size={24}
          onClick={onClose}
          className="close-icon"
        />
      </div>
      
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
      
      <div className="search-results">
        {renderSearchResults()}
      </div>
    </div>
  );
};

export default IndividualTextSearch;

IndividualTextSearch.propTypes = {
  onClose: PropTypes.func.isRequired,
  textId: PropTypes.string,
  handleSegmentNavigate: PropTypes.func.isRequired,
};