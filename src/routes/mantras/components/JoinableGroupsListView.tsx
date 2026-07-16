import { useCallback, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { IoArrowBack } from "react-icons/io5";
import { fetchPublicGroups } from "../api/accumulatorApi.ts";
import JoinableGroupCard from "./JoinableGroupCard.tsx";
import PaginationComponent from "../../commons/pagination/PaginationComponent.tsx";
import { getEarlyReturn } from "../../../utils/helperFunctions.tsx";
import { siteDescription, siteName } from "../../../utils/constants.ts";
import Seo from "../../commons/seo/Seo.tsx";
import DownloadAppModal from "../../../components/DownloadAppModal.tsx";
import {
  isMobileDevice,
  openAppDownloadPage,
} from "../../../utils/deviceUtils.ts";
import type { PlanLanguageCode } from "../../planviewer/utils/seriesUtils.ts";

type JoinableGroupsListViewProps = {
  apiLanguage: string;
  language: PlanLanguageCode;
  onBack: () => void;
};

const JoinableGroupsListView = ({
  apiLanguage,
  language,
  onBack,
}: JoinableGroupsListViewProps) => {
  const { t } = useTranslate();
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
  });

  const skip = useMemo(
    () => (pagination.currentPage - 1) * pagination.limit,
    [pagination],
  );

  const handleOpenApp = useCallback(() => {
    if (isMobileDevice()) {
      openAppDownloadPage();
      return;
    }
    setDownloadModalOpen(true);
  }, []);

  const { data, isLoading, error } = useQuery(
    ["public-groups", apiLanguage, skip, pagination.limit],
    () => fetchPublicGroups(apiLanguage, pagination.limit, skip),
    { refetchOnWindowFocus: false },
  );

  const earlyReturn = getEarlyReturn({ isLoading, error, t });
  if (earlyReturn) return earlyReturn;

  const groups = data?.groups ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / pagination.limit);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  return (
    <>
      <Seo
        title={`${t("mantras.joinable_groups", "Groups to Join")} | ${siteName}`}
        description={siteDescription}
        canonical={`${window.location.origin}/`}
      />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 pb-10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-amber-800 transition hover:text-amber-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-label={t("mantras.back_to_home", "Back to home")}
        >
          <IoArrowBack className="size-4" aria-hidden="true" />
          {t("mantras.back", "Back")}
        </button>

        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t("mantras.joinable_groups", "Groups to Join")}
          </h1>
          <p className="text-sm text-gray-600">
            {t(
              "mantras.joinable_groups_description",
              "Tap a group to download the app and join.",
            )}
          </p>
        </header>

        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 px-6 py-12 text-center">
            <p className="text-gray-600">
              {t(
                "mantras.no_joinable_groups",
                "No groups available to join yet.",
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {groups.map((group) => (
                <JoinableGroupCard
                  key={group.id}
                  group={group}
                  language={language}
                  onOpenApp={handleOpenApp}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <PaginationComponent
                pagination={pagination}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                setPagination={setPagination}
              />
            )}
          </>
        )}
      </div>
      <DownloadAppModal
        open={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />
    </>
  );
};

export default JoinableGroupsListView;
