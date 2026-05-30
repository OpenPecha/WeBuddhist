import { Link } from "react-router-dom";
import { useTranslate } from "@tolgee/react";
import { useQuery } from "react-query";
import SeriesCard from "./components/SeriesCard";
import {
  fetchSeries,
  getPlannerLanguage,
  SERIES_PAGE_LIMIT,
} from "./plannerApi";

const SeriesPage = () => {
  const { t } = useTranslate();
  const plannerLanguage = getPlannerLanguage();
  const { data, isLoading, isError } = useQuery(
    ["series", "list", SERIES_PAGE_LIMIT],
    () => fetchSeries(0, SERIES_PAGE_LIMIT),
    { refetchOnWindowFocus: false },
  );

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <Link
          to="/"
          className="text-blue-600 font-semibold hover:underline mb-8 inline-block"
        >
          ← Back to home
        </Link>
        <h1 className="text-4xl font-bold mb-2">Reading Series</h1>
        <p className="text-gray-600 mb-10 max-w-2xl">
          Follow curated series that group related reading plans into a longer
          path through the Dharma.
        </p>

        {isLoading && (
          <p className="text-gray-500 text-center py-12">
            {t("common.loading")}
          </p>
        )}
        {isError && !isLoading && (
          <p className="text-gray-500 text-center py-12">
            {t("global.not_found")}
          </p>
        )}
        {!isLoading && !isError && data?.series.length === 0 && (
          <p className="text-gray-500 text-center py-12">
            No series available yet.
          </p>
        )}
        {!isLoading && !isError && data && data.series.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.series.map((item) => (
              <SeriesCard
                key={item.id}
                item={item}
                language={plannerLanguage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesPage;
