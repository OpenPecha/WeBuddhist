import { useEffect, useRef } from "react";
import { IoCheckmark } from "react-icons/io5";
import type { DayStripItem } from "../utils/dayStripUtils.ts";

type DaySelectorStripProps = {
  days: DayStripItem[];
  activeDayNumber: number;
  completedDayNumbers?: ReadonlySet<number>;
  onSelectDay: (date: string) => void;
};

const DaySelectorStrip = ({
  days,
  activeDayNumber,
  completedDayNumbers,
  onSelectDay,
}: DaySelectorStripProps) => {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView?.({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeDayNumber]);

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-2.5">
        {days.map((day) => {
          const isActive = day.dayNumber === activeDayNumber;
          const isCompleted = completedDayNumbers?.has(day.dayNumber) ?? false;

          return (
            <button
              key={day.date}
              ref={isActive ? activeRef : undefined}
              type="button"
              onClick={() => onSelectDay(day.date)}
              className={`relative flex h-[72px] w-[64px] shrink-0 flex-col items-center justify-center rounded-2xl border transition ${
                isActive
                  ? "border-transparent bg-white ring-2 ring-stone-900 ring-offset-2 ring-offset-[#FAF9F6] shadow-sm"
                  : isCompleted
                    ? "border-stone-900/15 bg-stone-100 shadow-sm"
                    : "border-stone-100 bg-white shadow-sm hover:border-stone-200"
              }`}
              aria-current={isActive ? "date" : undefined}
              aria-label={`Day ${day.dayNumber}, ${day.shortLabel}${isCompleted ? ", completed" : ""}`}
            >
              {isCompleted && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-white">
                  <IoCheckmark className="text-[10px]" aria-hidden="true" />
                </span>
              )}
              <span
                className={`text-xl font-semibold leading-none ${
                  isCompleted && !isActive ? "text-stone-600" : "text-stone-900"
                }`}
              >
                {day.dayNumber}
              </span>
              {isActive ? (
                <span className="mt-1.5 rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-medium text-white">
                  {day.shortLabel}
                </span>
              ) : (
                <span className="mt-1.5 text-[10px] text-stone-500">
                  {day.shortLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DaySelectorStrip;
