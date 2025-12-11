import React from "react";
import { getEarlyReturn } from "../../../utils/helperFunctions.tsx";
import { Link } from "react-router-dom";
import { useTranslate } from "@tolgee/react";
import { Badge } from "@/components/ui/badge.tsx";

type VersionItem = {
  id: string;
  title: string;
  language: keyof typeof languageMap;
  table_of_contents?: string[];
  source_link?: string | null;
  license?: string | null;
};

type VersionsData = {
  versions: VersionItem[];
  text?: VersionItem;
};

type VersionsProps = {
  contentId?: string;
  versions: VersionsData;
  versionsIsLoading: boolean;
  versionsIsError: unknown;
};

const languageMap = {
  sa: "language.sanskrit",
  bo: "language.tibetan",
  en: "language.english",
  zh: "language.chinese",
  it: "language.italian",
  tib: "language.tibetan",
  tibphono: "language.tibetan",
};

const CommonCard = ({
  version,
  contentId,
}: {
  version: VersionItem;
  contentId?: string;
}) => {
  const { t } = useTranslate();
  return (
    <div className="w-full flex items-center bg-white py-1 border-t">
      <div className="flex flex-1 flex-col gap-2">
        <Link
          to={`/chapter?text_id=${version.id}&content_id=${contentId}`}
          className="text-left"
        >
          <div className={` text-lg font-medium text-zinc-600`}>
            {version.title}
          </div>
        </Link>
        <div className="space-y-1 text-sm text-zinc-600">
          {version.source_link && (
            <div className="flex gap-2">
              <span className="font-medium">Source: {version.source_link}</span>
            </div>
          )}
          {version.license && (
            <div className="flex gap-2">
              <span className="font-medium">License: {version.license}</span>
            </div>
          )}
        </div>
      </div>
      <Badge variant="outline" className="w-fit py-2 px-4">
        {t(languageMap[version.language])}
      </Badge>
    </div>
  );
};

const Versions = ({
  contentId: propContentId,
  versions,
  versionsIsLoading,
  versionsIsError,
}: VersionsProps) => {
  const { t } = useTranslate();

  const earlyReturn = getEarlyReturn({
    isLoading: versionsIsLoading,
    error: versionsIsError,
    t,
  });
  if (earlyReturn) return earlyReturn;
  if (versions.versions.length === 0 && !versions.text) {
    return (
      <div className="rounded border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
        <p className="mt-2">{t("global.not_found")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {versions.text && (
        <CommonCard version={versions.text} contentId={propContentId} />
      )}

      {versions?.versions.map((version) => {
        const firstContentId = version.table_of_contents?.[0];
        return (
          <CommonCard
            key={version.id}
            version={version}
            contentId={firstContentId}
          />
        );
      })}
    </div>
  );
};

export default React.memo(Versions);
