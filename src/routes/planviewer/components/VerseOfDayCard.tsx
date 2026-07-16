import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { fetchVerseOfDayToday } from "../api/plansApi.ts";
import { getVerseAttribution, getVerseText } from "../utils/seriesUtils.ts";
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
      <div className="animate-pulse bg-[#f4f6f8]">
        <div className="h-[min(52vh,480px)] w-full bg-slate-200/70" />
        <div className="mx-auto max-w-3xl space-y-3 px-6 py-10">
          <div className="mx-auto h-3 w-40 rounded-full bg-slate-200" />
          <div className="mx-auto h-5 w-full max-w-xl rounded-full bg-slate-200/80" />
          <div className="mx-auto h-5 w-4/5 max-w-lg rounded-full bg-slate-200/70" />
        </div>
      </div>
    );
  }

  if (!verse) return null;

  const verseText = getVerseText(verse.verses, verse.verse, apiLanguage);
  if (!verseText) return null;
  const verseAttribution = getVerseAttribution(verse.group_info, apiLanguage);
  const isTibetan = getLanguageClass(apiLanguage) === "bo-text";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; fail silently.
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCopy();
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-[#f4f6f8]"
      aria-label={t("plans.verse_of_day", "Verse of the day")}
    >
      {verse.image_url && (
        <div className="relative h-[min(52vh,480px)] w-full overflow-hidden">
          <img
            src={verse.image_url}
            alt=""
            className="h-full w-full object-cover animate-[fadeInUp_0.7s_ease-out]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f4f6f8] via-[#f4f6f8]/25 to-transparent" />
        </div>
      )}

      <button
        type="button"
        className={`relative z-10 mx-auto block w-full max-w-3xl cursor-pointer px-6 text-left ${verse.image_url ? "-mt-16 pb-12 pt-2" : "py-14"}`}
        title={t("plans.copy_to_clipboard", "Copy verse to clipboard")}
        onClick={handleCopy}
        onKeyDown={handleKeyDown}
        aria-label={t("plans.copy_to_clipboard", "Copy verse to clipboard")}
      >
        <p className="mb-5 text-center text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
          {t("plans.verse_of_day", "Verse of the day")}
        </p>
        <blockquote
          className={`text-center text-2xl leading-relaxed text-slate-800 sm:text-3xl sm:leading-snug ${getLanguageClass(apiLanguage)} ${
            isTibetan ? "" : "en-serif-text"
          }`}
        >
          “{verseText}”
        </blockquote>
        {verseAttribution && (
          <p className="mt-5 text-center text-sm font-medium tracking-wide text-slate-500 capitalize">
            — {verseAttribution}
          </p>
        )}
        {copied && (
          <p className="mt-4 text-center text-xs font-medium text-[#102544]/80 transition">
            {t("plans.copied", "Copied!")}
          </p>
        )}
      </button>
    </section>
  );
};

export default VerseOfDayCard;
