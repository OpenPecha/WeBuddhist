export type DayStripItem = {
  dayNumber: number;
  date: string;
  shortLabel: string;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function buildDayStrip(
  startDate: string,
  totalDays: number,
): DayStripItem[] {
  const start = new Date(`${startDate.slice(0, 10)}T12:00:00`);
  const items: DayStripItem[] = [];

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    items.push({
      dayNumber: i + 1,
      date: toIsoDate(date),
      shortLabel: date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      }),
    });
  }

  return items;
}

const TASK_ICONS = ["🧭", "🪔", "🌱", "💡", "🔑", "☸️", "✨", "📖", "🙏"];

export function getTaskIcon(index: number, title?: string | null): string {
  const lower = (title ?? "").toLowerCase();
  if (
    lower.includes("chant") ||
    lower.includes("pāli") ||
    lower.includes("pali")
  )
    return "☸️";
  if (lower.includes("homage")) return "🙏";
  if (lower.includes("intention") || lower.includes("aspiration")) return "✨";
  if (lower.includes("reading") || lower.includes("meaning")) return "📖";
  if (lower.includes("word")) return "💡";
  return TASK_ICONS[index % TASK_ICONS.length];
}
