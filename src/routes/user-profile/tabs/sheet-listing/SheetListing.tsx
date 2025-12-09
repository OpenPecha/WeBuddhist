import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { MdDeleteOutline } from "react-icons/md";

import axiosInstance from "../../../../config/axios-config.ts";
import { LANGUAGE } from "../../../../utils/constants.ts";
import { getLanguageClass, mapLanguageCode } from "../../../../utils/helperFunctions.tsx";
import PaginationComponent from "../../../commons/pagination/PaginationComponent.tsx";
import { deleteSheet } from "../../../sheets/view-sheet/SheetDetailPage.tsx";

type Sheet = {
  id: string;
  title: string;
  language: string;
  views: number;
  published_date?: string;
  publisher: { username: string };
};

type SheetResponse = {
  sheets: Sheet[];
  total: number;
};

type PaginationState = {
  currentPage: number;
  limit: number;
};

export const fetchsheet = async (email: string, limit: number, skip: number) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "en";
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.get("api/v1/sheets", {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : "Bearer None",
    },
    params: {
      language,
      email,
      limit,
      skip,
    },
  });
  return data as SheetResponse;
};

type SheetListingProps = {
  userInfo: { email?: string };
};

const SheetListing = ({ userInfo }: SheetListingProps) => {
  const navigate = useNavigate();
  const { t } = useTranslate();
  const [pagination, setPagination] = useState<PaginationState>({ currentPage: 1, limit: 10 });

  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);

  const handlePageChange = (pageNumber: number) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }));
  };

  const { mutate: deleteSheetMutation, isLoading: isDeleting } = useMutation({
    mutationFn: (sheetId: string) => deleteSheet(sheetId),
    onSuccess: () => navigate("/profile"),
    onError: (error) => {
      console.error("Error deleting sheet:", error);
    },
  });

  const {
    data: sheetsData,
    isLoading: sheetsIsLoading,
  } = useQuery(
    ["sheets-user-profile", pagination.currentPage, pagination.limit, userInfo?.email],
    () => fetchsheet(userInfo?.email ?? "", pagination.limit, skip),
    { refetchOnWindowFocus: false, enabled: !!userInfo?.email },
  );

  const totalPages = Math.ceil((sheetsData?.total || 0) / pagination.limit);

  if (!userInfo?.email) {
    return <p className="text-sm text-muted-foreground">{t("sheet.not_found")}</p>;
  }

  if (sheetsIsLoading) {
    return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
  }

  if (!sheetsData?.sheets?.length) {
    return <p className="text-sm text-muted-foreground">{t("sheet.not_found")}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {sheetsData.sheets.map((sheet) => (
          <div
            key={sheet.id}
            className="rounded-lg border bg-card p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Link
                  to={`/${encodeURIComponent(sheet.publisher.username)}/${sheet.title.replace(/\s+/g, "-").toLowerCase()}_${sheet.id}`}
                  className="group"
                >
                  <h4
                    className={`text-base font-semibold leading-snug text-foreground group-hover:text-primary ${getLanguageClass(sheet.language)}`}
                  >
                    {sheet.title}
                  </h4>
                </Link>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {sheet.views} {t("sheet.view_count")}
                  </span>
                  <span className="text-muted-foreground/60">•</span>
                  <span>{sheet.published_date?.split(" ")[0]}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => deleteSheetMutation(sheet.id)}
                aria-label={t("sheet.delete")}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isDeleting}
              >
                <MdDeleteOutline className="size-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {sheetsData.sheets.length > 0 && (
        <PaginationComponent
          pagination={pagination}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          setPagination={setPagination}
        />
      )}
    </div>
  );
};

export default SheetListing;
