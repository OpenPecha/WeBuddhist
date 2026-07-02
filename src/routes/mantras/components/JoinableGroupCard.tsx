import { useTranslate } from "@tolgee/react";
import type { AuthorGroupSummaryDTO } from "../types.ts";
import {
  getGroupDescriptionForLanguage,
  getGroupTitleForLanguage,
} from "../utils/groupUtils.ts";
import { getLanguageClass } from "../../../utils/helperFunctions.tsx";
import type { PlanLanguageCode } from "../../planviewer/utils/seriesUtils.ts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMemberInitials } from "../utils/groupUtils.ts";

type JoinableGroupCardProps = {
  group: AuthorGroupSummaryDTO;
  language: PlanLanguageCode;
  onSelect: (groupId: string) => void;
};

const JoinableGroupCard = ({
  group,
  language,
  onSelect,
}: JoinableGroupCardProps) => {
  const { t } = useTranslate();
  const title = getGroupTitleForLanguage(group.metadata, language);
  const description = getGroupDescriptionForLanguage(group.metadata, language);
  const contentFontClass = getLanguageClass(
    language === "BO" ? "bo-IN" : language === "ZH" ? "zh-Hans-CN" : "en",
  );

  const handleClick = () => {
    onSelect(group.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={title}
      className="group flex w-full items-start gap-4 rounded-2xl border border-amber-100 bg-white p-4 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      <Avatar className="size-14 border border-amber-100">
        {group.avatar_url ? (
          <AvatarImage src={group.avatar_url} alt="" />
        ) : null}
        <AvatarFallback className="bg-amber-50 text-amber-800">
          {getMemberInitials(title)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3
          className={`text-lg font-semibold text-gray-900 ${contentFontClass}`}
        >
          {title}
        </h3>
        {description && (
          <p
            className={`line-clamp-2 text-sm text-gray-600 ${contentFontClass}`}
          >
            {description}
          </p>
        )}
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
          <span>
            {group.joiner_count.toLocaleString()}{" "}
            {t("mantras.members_label", "members")}
          </span>
        </div>
      </div>
    </button>
  );
};

export default JoinableGroupCard;
