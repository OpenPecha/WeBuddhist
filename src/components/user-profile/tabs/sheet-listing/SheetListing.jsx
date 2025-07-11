import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { FaTimes } from "react-icons/fa";
import axiosInstance from "../../../../config/axios-config.js";
import { LANGUAGE } from "../../../../utils/constants.js";
import { getLanguageClass, mapLanguageCode } from "../../../../utils/helperFunctions.jsx";
import PaginationComponent from "../../../commons/pagination/PaginationComponent.jsx";
import { SheetDeleteModal } from "../../../sheets/local-components/modals/sheet-delete/sheet_delete.jsx";
import { deleteSheet } from "../../../sheets/view-sheet/SheetDetailPage.jsx";

export const fetchsheet = async (email, limit, skip) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "bo";
  const accessToken = sessionStorage.getItem('accessToken');
  const { data } = await axiosInstance.get("api/v1/sheets", {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : "Bearer None"
    },
    params: {
      language,
      email: email,
      limit,
      skip,
    },
  });
  return data;
};

const SheetListing = ({ userInfo }) => {
  const navigate = useNavigate();
  const { t } = useTranslate();
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSheetId, setSelectedSheetId] = useState(null);
  
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, currentPage: pageNumber }));
  };

  const { mutate: deleteSheetMutation } = useMutation({
    mutationFn: () => deleteSheet(selectedSheetId),
    onSuccess: () => {
      setIsModalOpen(false);
      navigate('/profile');
    },
    onError: (error) => {
      console.error("Error deleting sheet:", error);
    }
  });

  const { 
    data: sheetsData, 
    isLoading: sheetsIsLoading 
  } = useQuery(
    ["sheets-user-profile", pagination.currentPage, pagination.limit], 
    () => fetchsheet(userInfo?.email, pagination.limit, skip), 
    { refetchOnWindowFocus: false, enabled: !!userInfo?.email }
  );
  

  const totalPages = Math.ceil((sheetsData?.total || 0) / pagination.limit);
  if (!sheetsData?.sheets?.length) {
    return <p>{t("sheet.not_found")}</p>;
  }
  return (
    <div className="tab-content">
      <div className="sheets-list">
        {sheetsIsLoading ? (
          <p>Loading sheets...</p>
        ) : (
          sheetsData?.sheets.map((sheet) => (
            <div key={sheet.id} className="sheet-item">
              <div className="sheet-content listsubtitle">
                <div className="sheet-header">
                  <Link to={`/${encodeURIComponent(sheet.publisher.username)}/${sheet.title.replace(/\s+/g, '-').toLowerCase()}_${sheet.id}`}>
                    <h4 className={`sheet-title ${getLanguageClass(sheet.language)}`}>{sheet.title}</h4>
                  </Link>
                  <button className="sheet-delete">
                    <FaTimes onClick={() => {
                      setSelectedSheetId(sheet.id);
                      setIsModalOpen(true);
                    }} />
                  </button>
                </div>
                <div className="sheet-metadata content">
                  <span className="sheet-views">{sheet.views} {t("sheet.view_count")}</span>
                  <span className="sheet-dot">·</span>
                  <span className="sheet-date">{sheet.published_date?.split(' ')[0]}</span>
                  <span className="sheet-dot">·</span>
                </div>
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

      <SheetDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={deleteSheetMutation}
      />
    </div>
  );
};

export default SheetListing;