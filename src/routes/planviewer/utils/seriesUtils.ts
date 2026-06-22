import type {
  ImageUrlModel,
  SeriesMetadataDTO,
  SeriesPlanDTO,
} from "../types.ts";

export type PlanLanguageCode = "EN" | "BO" | "ZH";

const LANG_ORDER: PlanLanguageCode[] = ["EN", "BO", "ZH"];

export function normalizeMetadata(
  metadata: SeriesMetadataDTO[] | SeriesMetadataDTO | null | undefined,
): SeriesMetadataDTO[] {
  if (!metadata) return [];
  return Array.isArray(metadata) ? metadata : [metadata];
}

function normalizeLang(raw: string): PlanLanguageCode | null {
  const upper = raw.trim().toUpperCase();
  if (upper === "EN" || upper === "BO" || upper === "ZH") return upper;
  return null;
}

export function tolgeeToPlanLanguage(tolgeeLang: string): PlanLanguageCode {
  const mapped = normalizeLang(
    tolgeeLang === "bo-IN"
      ? "BO"
      : tolgeeLang === "zh-Hans-CN"
        ? "ZH"
        : tolgeeLang.toUpperCase(),
  );
  return mapped ?? "EN";
}

export function apiLanguageParam(tolgeeLang: string): string {
  const map: Record<string, string> = {
    en: "en",
    "bo-IN": "bo",
    bo: "bo",
    "zh-Hans-CN": "zh",
    zh: "zh",
  };
  return map[tolgeeLang] ?? "en";
}

export function getSeriesTitleForLanguage(
  metadata: SeriesMetadataDTO[] | SeriesMetadataDTO | null | undefined,
  language: PlanLanguageCode,
  fallback = "Untitled series",
): string {
  const rows = normalizeMetadata(metadata);
  if (!rows.length) return fallback;

  const preferred = rows.find(
    (row) => normalizeLang(String(row.language)) === language,
  );
  if (preferred?.title?.trim()) return preferred.title.trim();

  const english = rows.find(
    (row) => normalizeLang(String(row.language)) === "EN",
  );
  if (english?.title?.trim()) return english.title.trim();

  return rows[0]?.title?.trim() || fallback;
}

export function getSeriesDescriptionForLanguage(
  metadata: SeriesMetadataDTO[] | SeriesMetadataDTO | null | undefined,
  language: PlanLanguageCode,
): string {
  const rows = normalizeMetadata(metadata);
  const preferred = rows.find(
    (row) => normalizeLang(String(row.language)) === language,
  );
  if (preferred?.sub_title?.trim()) return preferred.sub_title.trim();

  const english = rows.find(
    (row) => normalizeLang(String(row.language)) === "EN",
  );
  return english?.sub_title?.trim() || rows[0]?.sub_title?.trim() || "";
}

export function getSeriesNavTitle(
  metadata: SeriesMetadataDTO[] | SeriesMetadataDTO | null | undefined,
  language: PlanLanguageCode,
  fallback = "Untitled series",
): string {
  const rows = normalizeMetadata(metadata);
  if (!rows.length) return fallback;

  const preferred = rows.find(
    (row) => normalizeLang(String(row.language)) === language,
  );
  const pick =
    preferred ??
    rows.find((r) => normalizeLang(String(r.language)) === "EN") ??
    rows[0];
  return pick.sub_title?.trim() || pick.title?.trim() || fallback;
}

export function getSeriesCardTitle(
  metadata: SeriesMetadataDTO[] | SeriesMetadataDTO | null | undefined,
  language: PlanLanguageCode,
  fallback = "Untitled series",
): string {
  return getSeriesTitleForLanguage(metadata, language, fallback);
}

export function resolveImageUrl(image?: ImageUrlModel | string | null): string {
  if (!image) return "";
  if (typeof image === "string") return image.trim();
  return (
    image.medium?.trim() ||
    image.thumbnail?.trim() ||
    image.original?.trim() ||
    ""
  );
}

export function sortPlans(plans: SeriesPlanDTO[]): SeriesPlanDTO[] {
  return [...plans].sort((a, b) => {
    const orderA =
      typeof a.display_order === "number" ? a.display_order : 1_000_000;
    const orderB =
      typeof b.display_order === "number" ? b.display_order : 1_000_000;
    return orderA - orderB;
  });
}

export function filterPlansByLanguage(
  plans: SeriesPlanDTO[],
  language: PlanLanguageCode,
): SeriesPlanDTO[] {
  const filtered = plans.filter(
    (plan) => normalizeLang(plan.language) === language,
  );
  if (filtered.length) return sortPlans(filtered);
  return sortPlans(plans);
}

export function getAvailablePlanLanguages(
  plans: SeriesPlanDTO[],
): PlanLanguageCode[] {
  const found = new Set<PlanLanguageCode>();
  for (const plan of plans) {
    const lang = normalizeLang(plan.language);
    if (lang) found.add(lang);
  }
  return LANG_ORDER.filter((code) => found.has(code));
}

export function formatDifficulty(level?: string): string {
  if (!level) return "";
  return level
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function pickEntryPlanId(
  plans: SeriesPlanDTO[],
  language: PlanLanguageCode,
): string | null {
  const visible = filterPlansByLanguage(plans, language);
  return visible[0]?.id ?? null;
}

export function getVerseText(
  verses: Record<string, string> | null | undefined,
  singleVerse: string | null | undefined,
  lang: string,
): string {
  if (singleVerse?.trim()) return singleVerse.trim();
  if (!verses) return "";
  if (verses[lang]?.trim()) return verses[lang].trim();
  if (verses.en?.trim()) return verses.en.trim();
  const first = Object.values(verses).find((value) => value?.trim());
  return first?.trim() ?? "";
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
