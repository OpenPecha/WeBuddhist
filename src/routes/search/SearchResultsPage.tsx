import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslate } from "@tolgee/react";
import Sources from "./sources/Sources";
import { IoCheckmarkOutline } from "react-icons/io5";
import { IoMdArrowDropdown } from "react-icons/io";
import "./SearchResultsPage.scss";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { t } = useTranslate();
  const [activeTab, setActiveTab] = useState("sources");
  const [sortOption, setSortOption] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const renderSortButton = (optionKey: string, labelKey: string, defaultLabel: string) => (
    <button
      key={optionKey}
      className={`dropdown-item ${sortOption === optionKey ? "active" : ""}`}
      onClick={() => {
        setSortOption(optionKey);
        setDropdownOpen(false);
      }}
    >
      {sortOption === optionKey && (
        <span className="checkmark"><IoCheckmarkOutline/></span>
      )}
      {t(labelKey, defaultLabel)}
    </button>
  );

  const renderSearchResultsHeader = () => (
    <h2 className="search-query-text">
      {t("search_page.results_for", "Results for: ( {searchedItem} )", {
        searchedItem: query,
      })}
    </h2>
  );

  const renderTabNavigation = () => (
    <div className="custom-tabs">
      <button className={`nav-link ${activeTab === "sources" ? "active" : ""}`} onClick={() => { setActiveTab("sources"); setSortOption(null); }}>
        {t("sheet.sources", "Sources")}
      </button>
      {/* <button className={`nav-link ${activeTab === "sheets" ? "active" : ""}`} onClick={() => { setActiveTab("sheets"); setSortOption(null); }}>
        {t("common.sheets", "Sheets")}
      </button> */}
    </div>
  );

  const renderSortDropdown = () => (
    <div className="sort-dropdown">
      <button
        className="sort-toggle"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {t("profile.tab.dropdown.sort", "Sort")}
        <IoMdArrowDropdown />
      </button>
      {dropdownOpen && (
        <div className="sort-menu">
          {activeTab === "sources" ? (
            <>
              {renderSortButton("relevance", "filter_list.relevance", "Relevance")}
              {renderSortButton("chronological", "filter_list.chronological", "Chronological")}
            </>
          ) : (
            <>
              {renderSortButton("relevance", "filter_list.relevance", "Relevance")}
              {renderSortButton("date_created", "filter_list.date_created", "Date created")}
              {renderSortButton("views", "profile.tab.sheet.tag.views", "Views")}
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderTabsContainer = () => (
    <div className="tabs-container">
      {renderTabNavigation()}
      {/* {renderSortDropdown()} */}
    </div>
  );

  const renderTabContent = () => (
    <div className="tab-content-container">
      {activeTab === "sources" && <Sources query={query} />}
      {/* {activeTab === "sheets" && <Sheets query={query} />} */}
    </div>
  );

  const renderMainContent = () => (
    <div className="main-content">
      <div className="container">
        {renderSearchResultsHeader()}
        {renderTabsContainer()}
        {renderTabContent()}
      </div>
    </div>
  );

  return (
    <div className="search-results-wrapper">
      <div className="search-results-container listtitle">
        {renderMainContent()}
        <div className="sidebar">
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
