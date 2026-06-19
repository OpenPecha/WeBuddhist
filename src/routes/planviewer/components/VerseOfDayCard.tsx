import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { fetchVerseOfDayToday } from "../api/plansApi.ts";
import { getVerseText } from "../utils/seriesUtils.ts";
import { getLanguageClass } from "../../../utils/helperFunctions.tsx";
import { useState } from "react";

type VerseOfDayCardProps = {
  apiLanguage: string;
};

const VerseOfDayCard = ({ apiLanguage }: VerseOfDayCardProps) => {
  const { t } = useTranslate();
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery(
    ["verse-of-day", apiLanguage],
    () => fetchVerseOfDayToday(apiLanguage),
    { refetchOnWindowFocus: false },
  );

  const verse = data?.verse_of_day;
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <div className="mb-3 h-4 w-32 rounded bg-amber-100" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-amber-50" />
          <div className="h-4 w-4/5 rounded bg-amber-50" />
        </div>
      </div>
    );
  }

  if (!verse) return null;

  const verseText = getVerseText(verse.verses, verse.verse, apiLanguage);
  if (!verseText) return null;
  const isTibetan = getLanguageClass(apiLanguage) === "bo-text";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // Silently fail, or show message if desired
    }
  };

  return (
    <section
      className="relative flex flex-col sm:flex-row items-stretch gap-4 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-100/70 via-white to-amber-50/50 p-0 sm:p-6 shadow-[0_4px_16px_0_rgba(219,168,64,0.09)] cursor-pointer transition hover:shadow-lg"
      aria-label={t("plans.verse_of_day", "Verse of the day")}
      title={t("plans.copy_to_clipboard", "Copy verse to clipboard")}
      onClick={handleCopy}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleCopy();
        }
      }}
      role="button"
    >
      {verse.image_url && (
        <div className="relative sm:rounded-l-2xl overflow-hidden flex-shrink-0 min-h-[130px] sm:min-h-0 sm:w-1/3 w-full">
          <img
            src={verse.image_url}
            alt=""
            className="object-cover object-center w-full h-full min-h-[130px] sm:min-h-full sm:rounded-l-2xl"
            style={{ maxHeight: 220, minHeight: 120 }}
          />
          <span className="absolute inset-0 bg-gradient-to-t from-white/50 via-white/5 to-transparent pointer-events-none" />
        </div>
      )}
      <div
        className={`flex flex-1 flex-col justify-between p-6 ${!verse.image_url ? "" : "sm:pl-6"}`}
      >
        <div>
          <p className="mb-4 sm:mb-5 text-[0.83rem] font-bold uppercase tracking-widest text-amber-700 drop-shadow">
            <span className="inline-flex items-center gap-1">
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block text-amber-400"
              >
                <path
                  d="M12 2l2.09 6.26L20 9.27l-5.18 3.77L16.18 20 12 16.27 7.82 20l1.36-6.96L4 9.27l5.91-.99z"
                  fill="currentColor"
                />
              </svg>
              {t("plans.verse_of_day", "Verse of the day")}
            </span>
            {copied && (
              <span className="ml-2 text-amber-700 font-normal text-xs bg-amber-100 px-2 py-1 rounded transition">
                {t("plans.copied", "Copied!")}
              </span>
            )}
          </p>
          <blockquote
            className={`relative text-lg sm:text-xl leading-relaxed text-gray-800 pl-3 border-l-4 border-amber-300/40 ${getLanguageClass(apiLanguage)} ${
              isTibetan ? "" : "font-serif italic"
            }`}
          >
            {verseText}
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default VerseOfDayCard;
