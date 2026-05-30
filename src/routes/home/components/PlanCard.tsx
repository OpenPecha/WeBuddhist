import { FaBookOpen } from "react-icons/fa";
import { formatPlanAuthorName, type Plan } from "../plannerApi";

type PlanCardProps = {
  plan: Plan;
};

const PlanCard = ({ plan }: PlanCardProps) => {
  const authorName = formatPlanAuthorName(plan.author);
  const coverSrc =
    plan.image?.medium ?? plan.image?.thumbnail ?? plan.image?.original;

  return (
    <article className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      {coverSrc ? (
        <img
          src={coverSrc}
          alt=""
          className="w-full aspect-[4/3] object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <FaBookOpen className="text-4xl text-gray-400" aria-hidden />
        </div>
      )}
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {plan.total_days > 0 && (
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {plan.total_days} {plan.total_days === 1 ? "day" : "days"}
            </span>
          )}
          {plan.difficulty_level && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">
              {plan.difficulty_level.toLowerCase()}
            </span>
          )}
        </div>
        <h4 className="font-semibold mb-2 line-clamp-2">{plan.title}</h4>
        {plan.description && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-2">
            {plan.description}
          </p>
        )}
        {authorName && <p className="text-xs text-gray-500">By {authorName}</p>}
      </div>
    </article>
  );
};

export default PlanCard;
