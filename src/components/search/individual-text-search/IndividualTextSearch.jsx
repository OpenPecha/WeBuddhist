import React, { useState, useMemo } from 'react';
import { IoMdClose } from 'react-icons/io';
import { BiSearch } from 'react-icons/bi';
import { useTranslate } from '@tolgee/react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axios-config';
import PaginationComponent from '../../commons/pagination/PaginationComponent';
import { highlightSearchMatch } from '../../../utils/highlightUtils.jsx';
import { getLanguageClass } from '../../../utils/helperFunctions.jsx';
import './IndividualTextSearch.scss';

export const fetchTextSearchResults = async(query, textId, skip, pagination) => {
  const { data } = await axiosInstance.get(`api/v1/search`, {
    params: {
      query: query,
      search_type: 'TEXT',
      text_id: textId,
      limit: pagination.limit,
      skip: skip
    }
  });
  return data;
};

const IndividualTextSearch = ({ onClose, textId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchSubmitted, setIsSearchSubmitted] = useState(false);
  const { t } = useTranslate();
  const navigate = useNavigate();
  
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);
  
  const { data: searchResults, isLoading, error } = useQuery(
    ["textSearch", searchQuery, textId, skip, pagination],
    () => fetchTextSearchResults(searchQuery, textId, skip, pagination),
    {
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: isSearchSubmitted && searchQuery.trim() !== ''
    }
  );
  
  const searchText = searchResults?.search?.text || searchQuery;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      setIsSearchSubmitted(true);
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

    if (!searchResults || !searchResults.segments || searchResults.segments.length === 0) {
      return <div className="search-message">{t('search.zero_result', 'No results to display.')}</div>;
    }

    const totalSegments = searchResults.total || 0;
    const totalPages = Math.ceil(totalSegments / pagination.limit);

    return (
      <>
        <div className="results-count">
          <p>{t("sheet.search.total")}: {totalSegments}</p>
        </div>
        <div className="segments-list">
          {searchResults.segments.map((segment) => (
            <button 
              type="button" 
              key={segment.segment_id} 
              className={`segment-item ${getLanguageClass(segment.language)}`}
              onClick={() => {
                if (segment.segment_id && textId) {
                  navigate(`/texts/text-details?textId=${textId}&segmentId=${segment.segment_id}`);
                  onClose();
                }
              }}
            >
              <p dangerouslySetInnerHTML={{__html: highlightSearchMatch(segment.content, searchText, 'highlighted-text')}} />
            </button>
          ))}
        </div>
        {totalPages > 1 && (
          <PaginationComponent
            pagination={pagination}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            setPagination={setPagination}
          />
        )}
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