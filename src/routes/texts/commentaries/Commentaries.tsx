import React from "react";
import { useTranslate } from "@tolgee/react";
import {
  getEarlyReturn,
  getLanguageClass,
} from "../../../utils/helperFunctions.tsx";
import PaginationComponent from "../../commons/pagination/PaginationComponent.tsx";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge.tsx";

const LANGUAGE_MAP = {
  sa: "language.sanskrit",
  bo: "language.tibetan",
  en: "language.english",
  zh: "language.chinese",
  it: "language.italian",
};

type CommentaryItem = {
  id: string;
  title: string;
  language: keyof typeof LANGUAGE_MAP;
  source_link?: string | null;
  license?: string | null;
};

type PaginationState = { currentPage: number; limit: number };

type CommentariesProps = {
  textId?: string;
  items?: CommentaryItem[];
  isLoading: boolean;
  isError: unknown;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  addChapter?: (chapterData: any, currentChapter: any) => void;
  currentChapter?: any;
};

const Commentaries = ({
  items = [],
  isLoading,
  isError,
  pagination,
  setPagination,
  addChapter,
  currentChapter,
}: CommentariesProps) => {
  const { t } = useTranslate();

  const earlyReturn = getEarlyReturn({ isLoading, error: isError, t });
  if (earlyReturn) return earlyReturn;

  if (!items) {
    return (
      <div className="content">
        <p className="mt-4 text-gray-400">{t("global.not_found")}</p>
      </div>
    );
  }

  const totalPages = Math.ceil((items?.length || 0) / pagination.limit);

  const handlePageChange = (pageNumber: number) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }));
  };

  const CommentaryCard = ({ commentary }: { commentary: CommentaryItem }) => {
    const renderTitle = () => {
      if (addChapter) {
        return (
          <button
            type="button"
            onClick={() => {
              addChapter(
                {
                  textId: commentary.id,
                },
                currentChapter,
              );
            }}
            className="text-left cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div
              className={` text-lg font-medium text-zinc-600 ${getLanguageClass(commentary.language)}`}
            >
              {commentary.title}
            </div>
          </button>
        );
      }
      return (
        <Link to={`/chapter?text_id=${commentary.id}`} className="text-left">
          <div
            className={` text-lg font-medium text-zinc-600 ${getLanguageClass(commentary.language)}`}
          >
            {commentary.title}
          </div>
        </Link>
      );
    };

    return (
      <div className="w-full flex items-center bg-white py-1 border-t">
        <div className="flex flex-1 flex-col gap-2">
          {renderTitle()}

          <div className="space-y-1 text-sm text-gray-600">
            {commentary.source_link && (
              <div className="flex gap-2">
                <span className="font-medium">
                  Source: {commentary.source_link}
                </span>
              </div>
            )}
            {commentary.license && (
              <div className="flex gap-2">
                <span className="font-medium">
                  License: {commentary.license}
                </span>
              </div>
            )}
          </div>
        </div>
        <Badge variant="outline" className="w-fit px-4 py-2">
          {t(LANGUAGE_MAP[commentary.language])}
        </Badge>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {items.map((commentary) => (
        <CommentaryCard
          key={commentary.id}
          commentary={commentary as CommentaryItem}
        />
      ))}
      {items.length > 0 && totalPages > 1 && (
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

export default React.memo(Commentaries);
