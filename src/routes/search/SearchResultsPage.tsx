import React from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslate } from "@tolgee/react";
import TwoColumnLayout from "../../components/layout/TwoColumnLayout";
import Sources from "./sources/Sources";

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { t } = useTranslate();

  return (
    <TwoColumnLayout
      main={
        <div className="flex max-w-2xl mx-auto pt-10 flex-col gap-6 text-left">
          <h2 className="text-xl font-semibold text-[#4B4B4B]">
            {t("search_page.results_for", "Results for: ( {searchedItem} )", {
              searchedItem: query,
            })}
          </h2>

          <div className="border-b border-[#DEE2E6] pb-2">
            <span className="text-sm font-medium uppercase tracking-wide text-[#495057]">
              {t("sheet.sources", "Sources")}
            </span>
          </div>

          <Sources query={query} />
        </div>
      }
      sidebar={<div/>}
    />
  );
};

export default SearchResultsPage;
