import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { fetchPublicGroups } from "../api/accumulatorApi.ts";
import JoinableGroupCard from "./JoinableGroupCard.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlanLanguageCode } from "../../planviewer/utils/seriesUtils.ts";

const PREVIEW_COUNT = 3;

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
      <section className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {Array.from({ length: PREVIEW_COUNT }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!groups.length) return null;

  return (
    <section className="space-y-4">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t("mantras.joinable_groups", "Groups to Join")}
          </h2>
          <p className="text-sm text-gray-600">
            {t(
              "mantras.joinable_groups_description",
              "Tap a group to download the app and join.",
            )}
          </p>
        </div>
        {hasMoreGroups && (
          <button
            type="button"
            onClick={onViewAllGroups}
            className="shrink-0 text-sm font-medium text-amber-800 transition hover:text-amber-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            {t("mantras.show_all_groups", "Show all")}
          </button>
        )}
      </header>
      <div className="grid gap-4">
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
