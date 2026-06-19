import type { DailyPlanResponse } from "../types.ts";

export const PLAN_DAILY_AUDIO_ID = "plan-daily-audio";

export function getPrimaryDayAudioId(daily: DailyPlanResponse): string | null {
  if (daily.audio_url?.trim()) {
    return PLAN_DAILY_AUDIO_ID;
  }

  const sortedTasks = [...daily.tasks].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  );

  for (const task of sortedTasks) {
    const sortedSubtasks = [...task.subtasks].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
    );
    const audioSubtask = sortedSubtasks.find((subtask) =>
      subtask.audio_url?.trim(),
    );
    if (audioSubtask) return audioSubtask.id;
  }

  return null;
}
