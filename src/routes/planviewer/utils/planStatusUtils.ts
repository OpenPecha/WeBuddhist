import type { SeriesPlanDTO } from "../types.ts";
import {
  filterPlansByLanguage,
  sortPlans,
  type PlanLanguageCode,
} from "./seriesUtils.ts";

export type PlanRowStatus = "locked" | "current" | "available";

function toDateOnly(value: string): Date {
  return new Date(`${value.slice(0, 10)}T12:00:00`);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function resolvePlanInitialDate(
  plan: SeriesPlanDTO,
  today: Date = new Date(),
): string | null {
  if (!plan.start_date) return null;
  const start = toDateOnly(plan.start_date);
  const end = addDays(start, Math.max(plan.total_days, 1) - 1);
  if (today >= start && today <= end) return toIsoDate(today);
  return toIsoDate(start);
}

export function formatPlanDateRange(
  startDate: string | null | undefined,
  totalDays: number,
): string {
  if (!startDate) return "";
  const start = toDateOnly(startDate);
  const end = addDays(start, Math.max(totalDays, 1) - 1);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} - ${fmt(end)}`;
}

export function getPlanRowStatus(
  plan: SeriesPlanDTO,
  plans: SeriesPlanDTO[],
  today: Date,
  currentPlanId?: string | null,
): PlanRowStatus {
  const sorted = sortPlans(plans);

  if (currentPlanId) {
    if (plan.id === currentPlanId) return "current";
    const current = sorted.find((p) => p.id === currentPlanId);
    if (current) {
      const planOrder = plan.display_order ?? 999;
      const currentOrder = current.display_order ?? 999;
      if (planOrder > currentOrder) return "locked";
      return "available";
    }
  }

  if (!plan.start_date) {
    const firstWithoutDate = sorted.find((p) => !p.start_date);
    if (firstWithoutDate?.id === plan.id) return "current";
    return "available";
  }

  const start = toDateOnly(plan.start_date);
  if (start > today) return "locked";

  const index = sorted.findIndex((p) => p.id === plan.id);
  let rangeEnd: Date | null = null;

  if (index >= 0 && index + 1 < sorted.length && sorted[index + 1].start_date) {
    rangeEnd = addDays(toDateOnly(sorted[index + 1].start_date!), -1);
  } else if (plan.total_days > 0) {
    rangeEnd = addDays(start, plan.total_days - 1);
  }

  if (start <= today && (!rangeEnd || today <= rangeEnd)) {
    const activeByDate = sorted.find((candidate) => {
      if (!candidate.start_date) return false;
      const candidateStart = toDateOnly(candidate.start_date);
      if (candidateStart > today) return false;
      const candidateIndex = sorted.findIndex((p) => p.id === candidate.id);
      let candidateEnd: Date | null = null;
      if (
        candidateIndex >= 0 &&
        candidateIndex + 1 < sorted.length &&
        sorted[candidateIndex + 1].start_date
      ) {
        candidateEnd = addDays(
          toDateOnly(sorted[candidateIndex + 1].start_date!),
          -1,
        );
      } else if (candidate.total_days > 0) {
        candidateEnd = addDays(candidateStart, candidate.total_days - 1);
      }
      return !candidateEnd || today <= candidateEnd;
    });
    if (activeByDate?.id === plan.id) return "current";
  }

  return "available";
}

export function getPlanMissedDays(
  plan: SeriesPlanDTO,
  status: PlanRowStatus,
): number | null {
  if (status === "locked") return null;
  if (status === "current" && plan.total_days > 1) {
    return plan.total_days - 1;
  }
  if (status === "available" && plan.total_days > 0) {
    return plan.total_days;
  }
  return null;
}

export function getDailyMissedDays(dayNumber: number): number | null {
  if (dayNumber <= 1) return null;
  return dayNumber - 1;
}

export function resolveTodaysPlanId(
  plans: SeriesPlanDTO[],
  language: PlanLanguageCode,
  currentPlanId?: string | null,
  today: Date = new Date(),
): string | null {
  const visible = filterPlansByLanguage(plans, language);
  if (!visible.length) return null;

  if (currentPlanId) {
    const enrolledPlan = visible.find((plan) => plan.id === currentPlanId);
    if (
      enrolledPlan &&
      getPlanRowStatus(enrolledPlan, visible, today, currentPlanId) !== "locked"
    ) {
      return currentPlanId;
    }
  }

  const current = visible.find(
    (plan) =>
      getPlanRowStatus(plan, visible, today, currentPlanId) === "current",
  );
  if (current) return current.id;

  const available = visible.find(
    (plan) =>
      getPlanRowStatus(plan, visible, today, currentPlanId) === "available",
  );
  if (available) return available.id;

  return sortPlans(visible)[0]?.id ?? null;
}
