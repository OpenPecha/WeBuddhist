import {LANGUAGE} from "../../utils/constants.js";
import axiosInstance from "../../config/axios-config.js";
import {useQuery} from "react-query";
import {useSearchParams} from "react-router-dom";
import "./Topics.scss"
import React, {useMemo, useState} from "react";
import {useTranslate} from "@tolgee/react";
import {useDebounce} from "use-debounce";
import PaginationComponent from "../commons/pagination/PaginationComponent.jsx";
import {mapLanguageCode} from "../../utils/helperFunctions.jsx";

export const fetchTopics = async (parentId, searchFilter, limit, skip, hierarchy) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "bo";

  const { data } = await axiosInstance.get("api/v1/topics", {
    params: {
      language,
      ...(parentId && { parent_id: parentId }),
      ...(searchFilter && { search: searchFilter }),
      limit,
      skip,
      hierarchy
    },
  });

  return data;
};

const Topics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslate();

  const parentId = searchParams.get("id") || null;
  const [searchFilter, setSearchFilter] = useState("");
  const [debouncedSearchFilter] = useDebounce(searchFilter, 700);
  const [searchMode, setSearchMode] = useState({ isDeepSearch: false, hierarchy: true });
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);
  const cleanAlphabetArray = useMemo(() => {
    const regex = /[a-zA-Z.\u0F00-\u0FFF]/;
    return t("topic.alphabet").split("").filter(char => regex.exec(char) !== null);
  }, [t]);

  const { data: topicsData, isLoading } = useQuery(
    ["topics", parentId, debouncedSearchFilter, pagination.currentPage, pagination.limit],
    () => fetchTopics(parentId, debouncedSearchFilter, pagination.limit, skip, searchMode.hierarchy),
    { refetchOnWindowFocus: false }
  );

  const totalTopics = topicsData?.total || 0;
  const totalPages = Math.ceil(totalTopics / pagination.limit);
  const topicsList = topicsData || { topics: [], total: 0, skip: 0, limit: 12 };

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, currentPage: pageNumber }));
  };

  const handleTopicClick = (topic) => {
    if (topic?.has_child) {
      setSearchParams({ id: topic.id });
    }
  };

  const onDeepSearchButtonClick = () => {
    setSearchMode({ isDeepSearch: true, hierarchy: false });
    setSearchParams("");
  };

  const handleBackToDefaultSearch = () => {
    setSearchMode({ isDeepSearch: false, hierarchy: true });
    setSearchFilter("");
    setSearchParams("");
  };

  const renderTopicsTitle = () => (
    <h4 className="topics-title listtitle">
      {parentId ? topicsData?.parent?.title : t("topic.expore")}
    </h4>
  );

  const renderTopicCard = (topic, index) => (
    <div key={index}>
      <div className="topic-card">
        <button
          className="topic-button listtitle"
          onClick={() => handleTopicClick(topic)}
        >
          {topic.title}
        </button>
      </div>
    </div>
  );

  const renderAlphabetButton = (letter, index) => (
    <button
      key={index}
      className={`alphabet-button listsubtitle ${
        searchFilter === letter ? "active" : ""
      }`}
      onClick={() => setSearchFilter(letter)}
    >
      {letter}
    </button>
  );

  const renderAlphabetFilter = () => (
    <div className="alphabet-filter">
      {cleanAlphabetArray.map((letter, index) => renderAlphabetButton(letter, index))}
      <button
        className="clear-letter-click"
        onClick={() => setSearchFilter("")}
      >
        {t("topic.clear")}
      </button>
    </div>
  );

  const renderSearchInput = () => (
    <input
      type="text"
      placeholder="Search topics..."
      value={searchFilter}
      onChange={(e) => setSearchFilter(e.target.value)}
      className="search-input"
    />
  );

  const renderBackButton = () => (
    <button
      className="back-button"
      onClick={handleBackToDefaultSearch}
    >
      Back
    </button>
  );

  const renderDeepSearchButton = () => (
    <button 
      className="deep-search-button" 
      onClick={onDeepSearchButtonClick}
    >
      {t("topic.a_to_z")}
    </button>
  );

  const renderDeepSearchInterface = () => (
    <>
      {renderSearchInput()}
      {renderAlphabetFilter()}
      {renderBackButton()}
    </>
  );

  const renderDefaultSearchInterface = () => (
    <div className="deep-search-container">
      {renderDeepSearchButton()}
      <p>{t("topic.browse_topic")}</p>
    </div>
  );

  const renderSearchBar = () => (
    <div className="search-container">
      {searchMode.isDeepSearch
        ? renderDeepSearchInterface()
        : renderDefaultSearchInterface()}
    </div>
  );

  const renderEmptyState = () => (
    <div>
      <p>No topics found</p>
    </div>
  );

  const renderTopicsGrid = (filteredTopics) => (
    <div className="topics-list-wrapper">
      {filteredTopics.length > 0 
        ? filteredTopics.map((topic, index) => renderTopicCard(topic, index))
        : renderEmptyState()
      }
    </div>
  );

  const renderPaginationSection = (showPagination) => (
    showPagination && (
      <div className="pagination-container">
        <PaginationComponent
          pagination={pagination}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          setPagination={setPagination}
        />
      </div>
    )
  );

  const renderTopicsList = () => {
    const filteredTopics = topicsList.topics.filter((topic) => {
      if (searchFilter) {
        return topic.title.toLowerCase().startsWith(searchFilter.toLowerCase());
      }
      return true;
    });

    const shouldShowContent = (searchMode.isDeepSearch && searchFilter) || !searchMode.isDeepSearch;
    const showPagination = filteredTopics.length > 0;

    return (
      shouldShowContent && (
        <>
          {renderTopicsGrid(filteredTopics)}
          {renderPaginationSection(showPagination)}
        </>
      )
    );
  };

  const renderTopicsListSection = () => (
    <div className="topics-list">
      {renderTopicsTitle()}
      {renderSearchBar()}
      {isLoading ? <p>Loading topics...</p> : renderTopicsList()}
    </div>
  );

  const renderTopicInfoSection = () => (
    <div className="topic-info">
      <div className="topic-info-card">
        <div className="topic-info-card-body">
          <h5>Topic Information</h5>
          <p>Details about the selected topic will be displayed here.</p>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="topics-container">
      <div className="topics-wrapper">
        {renderTopicsListSection()}
        {renderTopicInfoSection()}
      </div>
    </div>
  );
};

export default React.memo(Topics);