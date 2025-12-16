import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { MdDeleteOutline } from "react-icons/md";
import { FiEye, FiClock } from "react-icons/fi";

import axiosInstance from "../../../../config/axios-config.ts";
import { LANGUAGE } from "../../../../utils/constants.ts";
import {
  getLanguageClass,
  mapLanguageCode,
} from "../../../../utils/helperFunctions.tsx";
import PaginationComponent from "../../../commons/pagination/PaginationComponent.tsx";
import { deleteSheet } from "../../../sheets/view-sheet/SheetDetailPage.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";

type Sheet = {
  id: string;
  title: string;
  language: string;
  views: number;
  time_passed?: string;
  is_published?: boolean;
  summary?: string;
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

export const fetchsheet = async (
  email: string,
  limit: number,
  skip: number,
) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "en";
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.get("/api/v1/sheets", {
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
  isOwnProfile: boolean;
};

const SheetListing = ({ userInfo, isOwnProfile }: SheetListingProps) => {
  const navigate = useNavigate();
  const { t } = useTranslate();
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    limit: 10,
  });

  const skip = useMemo(
    () => (pagination.currentPage - 1) * pagination.limit,
    [pagination],
  );

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

  const { data: sheetsData, isLoading: sheetsIsLoading } = useQuery(
    [
      "sheets-user-profile",
      userInfo?.email,
      pagination.currentPage,
      pagination.limit,
    ],
    () => fetchsheet(userInfo?.email ?? "", pagination.limit, skip),
    { refetchOnWindowFocus: false, enabled: !!userInfo?.email },
  );

  const totalPages = Math.ceil((sheetsData?.total || 0) / pagination.limit);

  if (sheetsIsLoading) {
    return (
      <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
    );
  }

  if (!sheetsData?.sheets?.length) {
    return (
      <section className="flex w-full flex-col h-[80vh] items-center justify-center bg-muted/10">
        <p className="text-lg font-semibold text-foreground">
          {t("sheet.not_found")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("community_empty_story")}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium w-full text-start text-foreground">
        Notes
      </p>
      <div className="grid gap-3">
        {sheetsData.sheets.map((sheet) => (
          <div key={sheet.id}>
            <div className="group flex items-start justify-between hover:cursor-pointer py-4 hover:bg-muted/50 rounded-lg transition-colors">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    to={`/${encodeURIComponent(sheet.publisher.username)}/${sheet.title.replace(/\s+/g, "-").toLowerCase()}_${sheet.id}`}
                    className="font-semibold text-lg text-start w-full text-foreground"
                  >
                    <span className={getLanguageClass(sheet.language)}>
                      {sheet.title}
                    </span>
                  </Link>

                  <Badge
                    variant={sheet.is_published ? "default" : "secondary"}
                    className="h-5 px-2 text-[10px] uppercase tracking-wider"
                  >
                    {sheet.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>

                <p className="text-sm text-start  text-muted-foreground line-clamp-2 leading-relaxed">
                  {sheet.summary}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1">
                    <FiEye className="size-3" />
                    <span>
                      {sheet.views} {t("sheet.view_count")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock className="size-3" />
                    <span>{sheet.time_passed}</span>
                  </div>
                </div>
              </div>
              {isOwnProfile && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    deleteSheetMutation(sheet.id);
                  }}
                  disabled={isDeleting}
                >
                  <MdDeleteOutline className="size-5" />
                </Button>
              )}
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
