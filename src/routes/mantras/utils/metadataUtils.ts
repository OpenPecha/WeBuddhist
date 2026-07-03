import type { PlanLanguageCode } from "../../planviewer/utils/seriesUtils.ts";

export function normalizeMetadata<T extends { language: string }>(
  metadata: T[] | T | null | undefined,
): T[] {
  if (!metadata) return [];
  return Array.isArray(metadata) ? metadata : [metadata];
}

export function normalizeLang(raw: string): PlanLanguageCode | null {
  const upper = raw.trim().toUpperCase();
  if (upper === "EN" || upper === "BO" || upper === "ZH") return upper;
  return null;
}
