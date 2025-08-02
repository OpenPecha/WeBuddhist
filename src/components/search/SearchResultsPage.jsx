import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslate } from "@tolgee/react";
import Sources from "./sources/Sources";
import { IoCheckmarkOutline } from "react-icons/io5";
import { IoMdArrowDropdown } from "react-icons/io";
import Sheets from "./sheets/Sheets";
import "./SearchResultsPage.scss";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { t } = useTranslate();
  const [activeTab, setActiveTab] = useState("sources");
  const [sortOption, setSortOption] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="search-results-wrapper">
      <div className="search-results-container listtitle">
        <div className="main-content">
          <div className="container">
            <h2 className="search-query-text">
              {t("search_page.results_for", "Results for: ( {searchedItem} )", {
                searchedItem: query,
              })}
            </h2>
            <div className="tabs-container">
              <div className="custom-tabs">
                <button
                  className={`nav-link ${activeTab === "sources" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("sources");
                    setSortOption(null);
                }}
              >
                {t("sheet.sources", "Sources")}
              </button>
              <button
                className={`nav-link ${activeTab === "sheets" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("sheets");
                  setSortOption(null);
                }}
              >
                {t("common.sheets", "Sheets")}
              </button>
              </div>
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
                      <button
                        className={`dropdown-item ${sortOption === "relevance" ? "active" : ""}`}
                        onClick={() => {
                          setSortOption("relevance");
                          setDropdownOpen(false);
                        }}
                      >
                        {sortOption === "relevance" && (
                          <span className="checkmark"><IoCheckmarkOutline/></span>
                        )}
                        {t("filter_list.relevance", "Relevance")}
                      </button>
                      <button
                        className={`dropdown-item ${sortOption === "chronological" ? "active" : ""}`}
                        onClick={() => {
                          setSortOption("chronological");
                          setDropdownOpen(false);
                        }}
                      >
                        {sortOption === "chronological" && (
                          <span className="checkmark"><IoCheckmarkOutline/></span>
                        )}
                        {t("filter_list.chronological", "Chronological")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className={`dropdown-item ${sortOption === "relevance" ? "active" : ""}`}
                        onClick={() => {
                          setSortOption("relevance");
                          setDropdownOpen(false);
                        }}
                      >
                        {sortOption === "relevance" && (
                          <span className="checkmark"><IoCheckmarkOutline/></span>
                        )}
                        {t("filter_list.relevance", "Relevance")}
                      </button>
                      <button
                        className={`dropdown-item ${sortOption === "date_created" ? "active" : ""}`}
                        onClick={() => {
                          setSortOption("date_created");
                          setDropdownOpen(false);
                        }}
                      >
                        {sortOption === "date_created" && (
                          <span className="checkmark"><IoCheckmarkOutline/></span>
                        )}
                        {t("filter_list.date_created", "Date created")}
                      </button>
                      <button
                        className={`dropdown-item ${sortOption === "views" ? "active" : ""}`}
                        onClick={() => {
                          setSortOption("views");
                          setDropdownOpen(false);
                        }}
                      >
                        {sortOption === "views" && (
                          <span className="checkmark"><IoCheckmarkOutline/></span>
                        )}
                        {t("profile.tab.sheet.tag.views", "Views")}
                      </button>
                    </>
                  )}
                </div>
              )}
              </div>
            </div>
            <div className="tab-content-container">
              {activeTab === "sources" && <Sources query={query} />}
              {activeTab === "sheets" && <Sheets query={query} />}
            </div>
          </div>
        </div>
        <div className="sidebar">
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
