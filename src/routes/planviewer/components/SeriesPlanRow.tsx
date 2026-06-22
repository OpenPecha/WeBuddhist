import { useTranslate } from "@tolgee/react";
import { IoLockClosed } from "react-icons/io5";
import type { SeriesPlanDTO } from "../types.ts";
import {
  formatPlanDateRange,
  getPlanMissedDays,
  type PlanRowStatus,
} from "../utils/planStatusUtils.ts";
import { resolveImageUrl } from "../utils/seriesUtils.ts";

type SeriesPlanRowProps = {
  plan: SeriesPlanDTO;
  status: PlanRowStatus;
  contentFontClass?: string;
  onSelect: (planId: string) => void;
};

const SeriesPlanRow = ({
  plan,
  status,
  contentFontClass = "",
  onSelect,
}: SeriesPlanRowProps) => {
  const { t } = useTranslate();
  const imageUrl = resolveImageUrl(plan.image);
  const dateRange = formatPlanDateRange(plan.start_date, plan.total_days);
  const isLocked = status === "locked";
  const isCurrent = status === "current";
  const missedDays = getPlanMissedDays(plan, status);

  return (
    <button
      type="button"
      disabled={isLocked}
      onClick={() => onSelect(plan.id)}
      className={`flex w-full items-center gap-3 py-4 text-left transition ${
        isLocked ? "cursor-not-allowed opacity-40" : "hover:bg-stone-100/80"
      }`}
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-100">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg text-stone-300">
            📖
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-[15px] font-semibold text-stone-900 ${contentFontClass}`}
        >
          {plan.title}
        </p>
        {dateRange && (
          <div className="mt-1">
            {isCurrent ? (
              <span className="inline-block rounded-full bg-stone-900 px-3 py-0.5 text-xs font-medium text-white">
                {dateRange}
              </span>
            ) : (
              <span className="text-sm text-stone-500">{dateRange}</span>
            )}
          </div>
        )}
      </div>

      {isLocked ? (
        <IoLockClosed
          className="shrink-0 text-lg text-stone-400"
          aria-hidden="true"
        />
      ) : (
        missedDays !== null && (
          <span className="shrink-0 text-xs text-stone-500">
            {missedDays}{" "}
            {t(
              "plans.missed_days",
              missedDays === 1 ? "missed day" : "missed days",
            )}
          </span>
        )
      )}
    </button>
  );
};

export default SeriesPlanRow;
