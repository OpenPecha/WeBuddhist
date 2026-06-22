import { describe, expect, test } from "vitest";
import { resolveTodaysPlanId } from "./planStatusUtils.ts";
import type { SeriesPlanDTO } from "../types.ts";

const plans: SeriesPlanDTO[] = [
  {
    id: "plan-1",
    title: "Days 1-6",
    language: "EN",
    status: "PUBLISHED",
    featured: false,
    display_order: 1,
    start_date: "2026-05-14T00:00:00Z",
    total_days: 6,
  },
  {
    id: "plan-2",
    title: "Days 7-37",
    language: "EN",
    status: "PUBLISHED",
    featured: false,
    display_order: 2,
    start_date: "2026-05-20T00:00:00Z",
    total_days: 31,
  },
];

describe("resolveTodaysPlanId", () => {
  test("returns the plan active on today's date", () => {
    const today = new Date("2026-06-19T12:00:00");
    expect(resolveTodaysPlanId(plans, "EN", null, today)).toBe("plan-2");
  });

  test("prefers enrolled current plan when available", () => {
    const today = new Date("2026-06-19T12:00:00");
    expect(resolveTodaysPlanId(plans, "EN", "plan-1", today)).toBe("plan-1");
  });

  test("returns null when no plans exist", () => {
    expect(resolveTodaysPlanId([], "EN")).toBeNull();
  });
});
