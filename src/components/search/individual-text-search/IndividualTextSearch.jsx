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

export const fetchTextSearchResults = async(query, skip, pagination) => {
  const { data } = await axiosInstance.get(`api/v1/search`, {
    params: {
      query: query,
      search_type: 'SOURCE',
      limit: pagination.limit,
      skip: skip
    }
  });
  return data;
};

const IndividualTextSearch = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchSubmitted, setIsSearchSubmitted] = useState(false);
  const { t } = useTranslate();
  const navigate = useNavigate();
  
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);
  
  const { data: searchResults, isLoading, error } = useQuery(
    ["globalTextSearch", searchQuery, skip, pagination],
    () => fetchTextSearchResults(searchQuery, skip, pagination),
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
      setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on new search
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

    if (!searchResults || !searchResults.sources || searchResults.sources.length === 0) {
      return <div className="search-message">{t('search.zero_result', 'No results to display.')}</div>;
    }

    const totalSources = searchResults.total || 0;
    const totalPages = Math.ceil(totalSources / pagination.limit);

    return (
      <>
        <div className="results-count">
          <p>{t("sheet.search.total")}: {totalSources}</p>
        </div>
        <div className="sources-list">
          {searchResults.sources.map((source) => (
            <div key={source.text.text_id} className={`source-item ${getLanguageClass(source.text.language)}`}>
              <h4>{source.text.title}</h4>
              {source.text.published_date && <span className='en-text'>{source.text.published_date}</span>}
              <div className="segments">
                {source.segment_match.map((segment) => (
                  <button 
                    type="button" 
                    key={segment.segment_id} 
                    className="segment"
                    onClick={() => {
                      if (segment.segment_id && source.text?.text_id) {
                        navigate(`/texts/text-details?textId=${source.text.text_id}&segmentId=${segment.segment_id}`);
                        onClose();
                      }
                    }}
                  >
                    <p dangerouslySetInnerHTML={{__html: highlightSearchMatch(segment.content, searchText, 'highlighted-text')}} />
                  </button>
                ))}
              </div>
            </div>
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
        <h2>{t('connection_panel.search_texts')}</h2>
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
              placeholder={t('connection_panel.search_texts')}
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