import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { fetchPublicGroups } from "../api/accumulatorApi.ts";
import JoinableGroupCard from "./JoinableGroupCard.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlanLanguageCode } from "../../planviewer/utils/seriesUtils.ts";

const PREVIEW_COUNT = 4;

type JoinableGroupsSectionProps = {
  apiLanguage: string;
  language: PlanLanguageCode;
  onOpenApp: () => void;
  onViewAllGroups: () => void;
};

const JoinableGroupsSection = ({
  apiLanguage,
  language,
  onOpenApp,
  onViewAllGroups,
}: JoinableGroupsSectionProps) => {
  const { t } = useTranslate();

  const { data, isLoading } = useQuery(
    ["public-groups-preview", apiLanguage],
    () => fetchPublicGroups(apiLanguage, PREVIEW_COUNT),
    { refetchOnWindowFocus: false },
  );

  const groups = data?.groups ?? [];
  const hasMoreGroups = (data?.total ?? groups.length) > PREVIEW_COUNT;

  if (isLoading) {
    return (
      <section className="space-y-5">
        <Skeleton className="h-8 w-56" />
        <div className="-mx-4 flex gap-4 overflow-hidden px-4 sm:-mx-6 sm:px-6">
          {Array.from({ length: PREVIEW_COUNT }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-44 w-[16rem] shrink-0 rounded-2xl"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!groups.length) return null;

  return (
    <section
      className="space-y-5"
      aria-label={t("mantras.joinable_groups", "Groups to Join")}
    >
      <header className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {t("mantras.joinable_groups", "Groups to Join")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t(
              "mantras.joinable_groups_description",
              "Practice together with the community.",
            )}
          </p>
        </div>
        {hasMoreGroups && (
          <button
            type="button"
            onClick={onViewAllGroups}
            className="shrink-0 text-sm font-semibold text-[#102544] transition hover:text-[#0c1c34] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102544]/40"
          >
            {t("mantras.show_all_groups", "See all")}
          </button>
        )}
      </header>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {groups.map((group) => (
          <JoinableGroupCard
            key={group.id}
            group={group}
            language={language}
            onOpenApp={onOpenApp}
          />
        ))}
      </div>
    </section>
  );
};

export default JoinableGroupsSection;
