import { describe, expect, test } from "vitest";
import { getPrimaryDayAudioId, PLAN_DAILY_AUDIO_ID } from "./planAudioUtils.ts";
import type { DailyPlanResponse } from "../types.ts";

const baseDaily: DailyPlanResponse = {
  plan_id: "plan-1",
  plan_title: "Test",
  plan_description: "",
  date: "2026-06-19",
  day_number: 1,
  total_days: 6,
  start_date: "2026-05-14",
  end_date: "2026-05-19",
  tasks: [
    {
      id: "task-1",
      title: "Reading",
      display_order: 1,
      subtasks: [
        {
          id: "sub-1",
          content_type: "TEXT",
          content: "Hello",
          display_order: 1,
        },
        {
          id: "sub-2",
          content_type: "AUDIO",
          audio_url: "https://example.com/a.mp3",
          display_order: 2,
        },
      ],
    },
    {
      id: "task-2",
      title: "Chanting",
      display_order: 2,
      subtasks: [
        {
          id: "sub-3",
          content_type: "AUDIO",
          audio_url: "https://example.com/b.mp3",
          display_order: 1,
        },
      ],
    },
  ],
};

describe("getPrimaryDayAudioId", () => {
  test("prefers plan-level daily audio", () => {
    expect(
      getPrimaryDayAudioId({
        ...baseDaily,
        audio_url: "https://example.com/daily.mp3",
      }),
    ).toBe(PLAN_DAILY_AUDIO_ID);
  });

  test("returns first subtask audio in task order", () => {
    expect(getPrimaryDayAudioId(baseDaily)).toBe("sub-2");
  });

  test("returns null when no audio exists", () => {
    expect(
      getPrimaryDayAudioId({
        ...baseDaily,
        tasks: [
          {
            id: "task-1",
            subtasks: [{ id: "sub-1", content_type: "TEXT", content: "Hi" }],
          },
        ],
      }),
    ).toBeNull();
  });
});
