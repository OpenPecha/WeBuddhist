import { FaBookOpen } from "react-icons/fa";
import { getSeriesMetadata, type Series } from "../plannerApi";

type SeriesCardProps = {
  item: Series;
  language: string;
  variant?: "light" | "dark";
};

const SeriesCard = ({ item, language, variant = "light" }: SeriesCardProps) => {
  const meta = getSeriesMetadata(item, language);
  if (!meta) return null;

  const isDark = variant === "dark";

  return (
    <article
      className={
        isDark
          ? "bg-white text-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          : "bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
      }
    >
      {item.image ? (
        <img
          src={item.image}
          alt=""
          className="w-full aspect-video object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <FaBookOpen className="text-4xl text-gray-400" aria-hidden />
        </div>
      )}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {item.featured && (
            <span className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Featured
            </span>
          )}
          {item.plan_count > 0 && (
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {item.plan_count} {item.plan_count === 1 ? "plan" : "plans"}
            </span>
          )}
        </div>
        <h4 className="text-lg font-bold mb-2 line-clamp-2">{meta.title}</h4>
        {meta.description && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {meta.description}
          </p>
        )}
      </div>
    </article>
  );
};

export default SeriesCard;
