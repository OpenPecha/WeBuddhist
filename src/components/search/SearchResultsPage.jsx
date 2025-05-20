import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Container, Tabs, Tab, Dropdown } from "react-bootstrap";
import { useTranslate } from "@tolgee/react";
import Sources from "./sources/Sources";
import Sheets from "./sheets/Sheets";
import "./SearchResultsPage.scss";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { t } = useTranslate();
  const [activeTab, setActiveTab] = useState("sources");
  const [sortOption, setSortOption] = useState(null);

  return (
    <Container className="search-results-container">
      <h2 className="search-query-text">
        {t("search_page.results_for", "Results for: ( {searchedItem} )", {
          searchedItem: query,
        })}
      </h2>
      <div className="tabs-container">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => {
            setActiveTab(k);
            setSortOption(null);
          }}
          id="search-tabs"
          className="custom-tabs"
        >
          <Tab eventKey="sources" title={t("sheet.sources", "Sources")} />
          <Tab eventKey="sheets" title={t("common.sheets", "Sheets")} />
        </Tabs>
        <Dropdown className="sort-dropdown">
          <Dropdown.Toggle
            variant="light"
            id="sort-dropdown"
            className="sort-toggle"
          >
            {t("profile.tab.dropdown.sort", "Sort")}
          </Dropdown.Toggle>
          <Dropdown.Menu align="end">
            {activeTab === "sources" ? (
              <>
                <Dropdown.Item
                  active={sortOption === "relevance"}
                  onClick={() => setSortOption("relevance")}
                >
                  {sortOption === "relevance" && (
                    <span className="checkmark">✓</span>
                  )}
                  {t("filter_list.relevance", "Relevance")}
                </Dropdown.Item>
                <Dropdown.Item
                  active={sortOption === "chronological"}
                  onClick={() => setSortOption("chronological")}
                >
                  {sortOption === "chronological" && (
                    <span className="checkmark">✓</span>
                  )}
                  {t("filter_list.chronological", "Chronological")}
                </Dropdown.Item>
              </>
            ) : (
              <>
                <Dropdown.Item
                  active={sortOption === "relevance"}
                  onClick={() => setSortOption("relevance")}
                >
                  {sortOption === "relevance" && (
                    <span className="checkmark">✓</span>
                  )}
                  {t("filter_list.relevance", "Relevance")}
                </Dropdown.Item>
                <Dropdown.Item
                  active={sortOption === "date_created"}
                  onClick={() => setSortOption("date_created")}
                >
                  {sortOption === "date_created" && (
                    <span className="checkmark">✓</span>
                  )}
                  {t("filter_list.date_created", "Date created")}
                </Dropdown.Item>
                <Dropdown.Item
                  active={sortOption === "views"}
                  onClick={() => setSortOption("views")}
                >
                  {sortOption === "views" && (
                    <span className="checkmark">✓</span>
                  )}
                  {t("profile.tab.sheet.tag.views", "Views")}
                </Dropdown.Item>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <div className="tab-content-container">
        {activeTab === "sources" && <Sources />}
        {activeTab === "sheets" && <Sheets />}
      </div>
    </Container>
  );
};

export default SearchResultsPage;
