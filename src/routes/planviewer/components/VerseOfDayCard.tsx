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
      <div className="animate-pulse border-b border-amber-100 bg-white">
        <div className="mx-auto flex h-48 max-h-[min(420px,45vh)] w-full max-w-5xl items-center justify-center bg-amber-50/60" />
        <div className="mx-auto max-w-5xl space-y-2 px-4 py-6">
          <div className="h-4 w-32 rounded bg-amber-100" />
          <div className="h-4 w-full rounded bg-amber-50" />
          <div className="h-4 w-4/5 rounded bg-amber-50" />
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
    } catch (e) {
      // Silently fail, or show message if desired
    }
  };

  return (
    <section
      className=" "
      aria-label={t("plans.verse_of_day", "Verse of the day")}
    >
      {verse.image_url && (
        <div className="mx-auto flex w-full max-w-5xl justify-center ">
          <img
            src={verse.image_url}
            alt=""
            className="max-h-[min(420px,45vh)] w-full object-cover"
          />
        </div>
      )}

      <div
        className="mx-auto max-w-5xl cursor-pointer pt-3 transition border border-gray-200"
        title={t("plans.copy_to_clipboard", "Copy verse to clipboard")}
        onClick={handleCopy}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCopy();
          }
        }}
        role="button"
      >
        <blockquote
          className={`relative text-lg leading-relaxed text-center text-gray-800 sm:text-xl ${getLanguageClass(apiLanguage)} ${
            isTibetan ? "" : "font-serif italic"
          }`}
        >
          {verseText}
        </blockquote>
        {verseAttribution && (
          <div className=" text-center text-xs text-gray-400 ">
            — {verseAttribution}
          </div>
        )}
        <p className="text-center mb-2 text-[0.6rem] font-bold uppercase tracking-widest text-gray-400 sm:mb-5">
          {t("plans.verse_of_day", "Verse of the day")}
          {copied && (
            <span className="ml-2 rounded bg-amber-100 px-2 py-1 text-xs font-normal text-amber-700 transition">
              {t("plans.copied", "Copied!")}
            </span>
          )}
        </p>
      </div>
    </section>
  );
};

export default VerseOfDayCard;
