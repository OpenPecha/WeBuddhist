import { Link } from "react-router-dom";
import { useTranslate } from "@tolgee/react";
import { useQuery } from "react-query";
import PlanCard from "./components/PlanCard";
import { fetchPlans, PLANS_PAGE_LIMIT } from "./plannerApi";

const PlansPage = () => {
  const { t } = useTranslate();
  const { data, isLoading, isError } = useQuery(
    ["plans", "list", PLANS_PAGE_LIMIT],
    () => fetchPlans(0, PLANS_PAGE_LIMIT),
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
        <h1 className="text-4xl font-bold mb-2">Dharma Reading Plans</h1>
        <p className="text-gray-600 mb-10 max-w-2xl">
          Find a plan that speaks to your spiritual journey.
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
        {!isLoading && !isError && data?.plans.length === 0 && (
          <p className="text-gray-500 text-center py-12">
            No reading plans available yet.
          </p>
        )}
        {!isLoading && !isError && data && data.plans.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlansPage;
