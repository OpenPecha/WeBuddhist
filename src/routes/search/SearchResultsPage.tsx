import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslate } from "@tolgee/react";
import TwoColumnLayout from "../../components/layout/TwoColumnLayout";
import Sources from "./sources/Sources";
import TitleSearch from "./title-search/TitleSearch";

const TABS = ["all", "sources", "titles", "author"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  all: "All",
  sources: "Sources",
  titles: "Titles",
  author: "Author",
};

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { t } = useTranslate();
  const [activeTab, setActiveTab] = useState<Tab>("all");

  return (
    <TwoColumnLayout
      main={
        <div className="flex max-w-2xl mx-auto pt-10 flex-col gap-4 text-left">
          <h2 className="text-xl font-medium text-[#4B4B4B]">
            {t("search_page.results_for", "Results for: ( {searchedItem} )", {
              searchedItem: query,
            })}
          </h2>
          <div className="flex gap-6 border-b border-[#DEE2E6]" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={`pb-2 text-sm font-medium uppercase tracking-wide bg-transparent cursor-pointer border-x-0 border-t-0 ${
                  activeTab === tab
                    ? "text-[#495057] border-b-2 border-[#495057]"
                    : "text-gray-400 hover:text-gray-600 border-b-2 border-transparent"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {t(`search_page.tab_${tab}`, TAB_LABELS[tab])}
              </button>
            ))}
          </div>
          {(activeTab === "all" || activeTab === "sources") && (
            <Sources query={query} />
          )}
          {(activeTab === "all" || activeTab === "titles") && (
            <TitleSearch
              query={query}
              mode={activeTab === "all" ? "all" : "title"}
            />
          )}
          {activeTab === "author" && (
            <TitleSearch query={query} mode="author" />
          )}
        </div>
      }
      sidebar={<div />}
    />
  );
};

export default SearchResultsPage;
