import React from 'react';
import { useTranslate } from '@tolgee/react';
import { getEarlyReturn } from '../../../utils/helperFunctions.tsx';
import PaginationComponent from '../../commons/pagination/PaginationComponent.tsx';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.tsx';

const LANGUAGE_MAP = {
  sa: 'language.sanskrit',
  bo: 'language.tibetan',
  en: 'language.english',
  zh: 'language.chinese',
  it: 'language.italian'
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
};

const Commentaries = ({
  items = [],
  isLoading,
  isError,
  pagination,
  setPagination,
}: CommentariesProps) => {
  const { t } = useTranslate();

  const earlyReturn = getEarlyReturn({ isLoading, error: isError, t });
  if (earlyReturn) return earlyReturn;

  if (!items || items.length === 0) {
    return (
      <div className="content">
        <p className='mt-4 text-gray-400'>{t('global.not_found')}</p>
      </div>
    );
  }

  const totalPages = Math.ceil((items?.length || 0) / pagination.limit);

  const handlePageChange = (pageNumber: number) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }));
  };

  const CommentaryCard = ({ commentary }: { commentary: CommentaryItem }) => (
    <div className="w-full flex items-center bg-white py-1 border-t">
      <div className="flex flex-1 flex-col gap-2">
      <Link
        to={`/chapter?text_id=${commentary.id}`}
        className="text-left"
      >
        <div className={` text-lg font-medium text-zinc-600`}>
          {commentary.title}
        </div>
      </Link>

      <div className="space-y-1 text-sm text-gray-600">
        {commentary.source_link && (
          <div className="flex gap-2">
            <span className="font-medium">Source: {commentary.source_link}</span>
          </div>
        )}
        {commentary.license && (
          <div className="flex gap-2">
            <span className="font-medium">License: {commentary.license}</span>
          </div>
        )}
      </div>
      </div>
      <Badge variant="outline" className="w-fit px-4 py-2">
        {t(LANGUAGE_MAP[commentary.language])}
      </Badge>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {items.map((commentary) => (
        <CommentaryCard key={commentary.id} commentary={commentary as CommentaryItem} />
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