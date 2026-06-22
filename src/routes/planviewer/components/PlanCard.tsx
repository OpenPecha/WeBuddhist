import { useTranslate } from "@tolgee/react";
import type { SeriesPlanDTO, UserPlanDTO } from "../types.ts";
import { formatDifficulty, resolveImageUrl } from "../utils/seriesUtils.ts";

type PlanCardProps = {
  plan: SeriesPlanDTO;
  progress?: UserPlanDTO;
  isCurrent?: boolean;
  showProgress: boolean;
};

const PlanCard = ({
  plan,
  progress,
  isCurrent,
  showProgress,
}: PlanCardProps) => {
  const { t } = useTranslate();
  const imageUrl = resolveImageUrl(plan.image);
  const hasStarted = Boolean(progress?.started_at);
  const difficulty = formatDifficulty(plan.difficulty_level);

  return (
    <article className="flex gap-4 rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-amber-50">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-amber-600/40">
            <span className="text-2xl">📖</span>
          </div>
        )}
        {showProgress && isCurrent && (
          <span className="absolute -right-1 -top-1 rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            {t("plans.current_plan", "Current")}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900">{plan.title}</h3>
          {showProgress && hasStarted && !isCurrent && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              {t("plans.started", "Started")}
            </span>
          )}
        </div>
        {plan.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {plan.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
          {plan.total_days > 0 && (
            <span>
              {plan.total_days} {t("plans.days_label", "days")}
            </span>
          )}
          {difficulty && <span>{difficulty}</span>}
          {plan.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-800"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default PlanCard;
