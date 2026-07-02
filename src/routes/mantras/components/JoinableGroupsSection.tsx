import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { fetchPublicGroups } from "../api/accumulatorApi.ts";
import JoinableGroupCard from "./JoinableGroupCard.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlanLanguageCode } from "../../planviewer/utils/seriesUtils.ts";

type JoinableGroupsSectionProps = {
  apiLanguage: string;
  language: PlanLanguageCode;
  onSelectGroup: (groupId: string) => void;
};

const JoinableGroupsSection = ({
  apiLanguage,
  language,
  onSelectGroup,
}: JoinableGroupsSectionProps) => {
  const { t } = useTranslate();

  const { data, isLoading } = useQuery(
    ["public-groups", apiLanguage],
    () => fetchPublicGroups(apiLanguage),
    { refetchOnWindowFocus: false },
  );

  const groups = data?.groups ?? [];

  if (isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!groups.length) return null;

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t("mantras.joinable_groups", "Groups to Join")}
        </h2>
        <p className="text-sm text-gray-600">
          {t(
            "mantras.joinable_groups_description",
            "Join a group to practice together and see fellow members.",
          )}
        </p>
      </header>
      <div className="grid gap-4">
        {groups.map((group) => (
          <JoinableGroupCard
            key={group.id}
            group={group}
            language={language}
            onSelect={onSelectGroup}
          />
        ))}
      </div>
    </section>
  );
};

export default JoinableGroupsSection;
