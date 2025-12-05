import { useMemo, useState, useEffect } from 'react';
import { useTranslate } from '@tolgee/react';
import { LANGUAGE } from '../../utils/constants.ts';
import { useQuery } from 'react-query';
import axiosInstance from '../../config/axios-config.ts';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../config/AuthContext.tsx';
import { useAuth0 } from '@auth0/auth0-react';
import { getLanguageClass, mapLanguageCode } from "../../utils/helperFunctions.tsx";
import TwoColumnLayout from "../../components/layout/TwoColumnLayout";
import PaginationComponent from "../commons/pagination/PaginationComponent.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from '@/components/ui/badge.tsx';

export const fetchsheet = async (limit: number, skip: number, sort_order: string) => {
    const storedLanguage = localStorage.getItem(LANGUAGE);
    const language = storedLanguage ? mapLanguageCode(storedLanguage) : "en";
    const { data } = await axiosInstance.get("api/v1/sheets", {
      params: {
        language,
        limit,
        skip,
        sort_by:"published_date",
        sort_order
      },
      headers: {
        Authorization: "Bearer None"
      },
    });
  
    return data;
  };
const CommunityPage = () => {
    const [sortOrder, setSortOrder] = useState('desc');
    const [pagination, setPagination] = useState(() => {
      const stored = localStorage.getItem('community-pagination');
      return stored ? JSON.parse(stored) : { currentPage: 1, limit: 5 };
    });

    useEffect(() => {
      localStorage.setItem('community-pagination', JSON.stringify(pagination));
    }, [pagination]);

    const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);

    const handlePageChange = (pageNumber: number) => {
      setPagination((prev: any) => ({ ...prev, currentPage: pageNumber }));
    };
    const handleSortChange = (value: string) => {
      setSortOrder(value);
    };
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth() as { isLoggedIn: boolean };
    const { isAuthenticated } = useAuth0();
    const {t}=useTranslate();

  const { 
    data: sheetsData, 
    isLoading: sheetsIsLoading 
  } = useQuery(
    ["sheets", pagination.currentPage, pagination.limit, sortOrder], 
    () => fetchsheet(pagination.limit, skip, sortOrder), 
    { refetchOnWindowFocus: false }
  );
  const totalPages = Math.ceil((sheetsData?.total || 0) / pagination.limit);
  const userIsLoggedIn = isLoggedIn || isAuthenticated;

  return (
    <TwoColumnLayout
      main={
        <div className="mx-auto flex w-full max-w-2xl flex-col  pt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-[#333030] ">
              {t("community.sheets.recently_published")}
            </h2>
            {sheetsData?.sheets?.length > 0 && (
              <Select value={sortOrder} onValueChange={handleSortChange}>
                <SelectTrigger
                  aria-label={t("community.sheets.recently_published")}
                  className="navbaritems cursor-pointer border border-[#18345D] bg-white px-3 text-base font-medium text-[#0b0b0b]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="navbaritems">
                  <SelectItem value="asc">{t("community.sheets.ascending")}</SelectItem>
                  <SelectItem value="desc">{t("community.sheets.descending")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex flex-col gap-5 md:gap-8">
            <div className="divide-y divide-gray-200">
              {sheetsIsLoading ? (
                <p className="pt-12 text-center text-gray-600">Loading notes...</p>
              ) : sheetsData?.sheets?.length === 0 ? (
                <div className="py-4 text-center text-gray-600">
                  <p className="navbaritems">{t("community_empty_story")}</p>
                </div>
              ) : (
                sheetsData?.sheets.map((sheet: any) => (
                  <div key={sheet.id} className=" py-3 text-left md:py-4">
                    <div className="space-y-2">
                      <Link
                        to={`/${encodeURIComponent(sheet.publisher.username)}/${sheet.title.replace(/\s+/g, '-').toLowerCase()}_${sheet.id}`}
                        className="no-underline"
                      >
                        <div className="mb-1 w-fit text-gray-800">
                          <p className={`text-base font-semibold text-gray-800`}>
                            {sheet.title}
                          </p>
                          <p className="text-sm text-justify">{sheet.summary}</p>
                        </div>
                      </Link>
                      <Link
                        to={`/user/${encodeURIComponent(sheet.publisher.username)}`}
                        className="flex w-fit items-center text-gray-500"
                      >
                        {sheet.publisher.avatar_url ? (
                          <img
                            src={sheet.publisher.avatar_url}
                            alt={sheet.publisher.name.split(' ').map((name: any) => name[0]).join('').substring(0, 2).toUpperCase()}
                            className="mr-2.5 h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="mr-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                            {sheet.publisher.name.split(' ').map((name: any) => name[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className='text-sm'>{sheet.publisher.name}</div>
                        <span className="mx-2 text-gray-300">·</span>
                        <Badge variant="secondary">{sheet.time_passed}</Badge>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
            {sheetsData?.sheets?.length > 0 && (
              <PaginationComponent
                pagination={pagination}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                setPagination={setPagination}
              />
            )}
          </div>
        </div>
      }
      sidebar={
        <div className="text-base space-y-4 text-gray-600">
          <p className="text-start">{t("side_nav.join_conversation.descriptions")}</p>
          <Button
            className="w-full bg-[#18345D] text-white hover:bg-[#102544]"
            onClick={() =>
              userIsLoggedIn
                ? (sessionStorage.removeItem('sheets-content'), sessionStorage.removeItem('sheet-title'), navigate("/sheets/new"))
                : navigate("/login")
            }
          >
            {t("side_nav.join_conversation.button.make_sheet")}
          </Button>
        </div>
      }
    />
  );
};

export default CommunityPage;
