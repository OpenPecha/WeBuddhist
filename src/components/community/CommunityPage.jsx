import React, { useMemo, useState, useEffect } from 'react';
import "./CommunityPage.scss";
import { useTranslate } from '@tolgee/react';
import { LANGUAGE } from '../../utils/constants.js';
import { useQuery } from 'react-query';
import axiosInstance from '../../config/axios-config.js';
import { useNavigate,Link } from 'react-router-dom';
import { useAuth } from '../../config/AuthContext.jsx';
import { useAuth0 } from '@auth0/auth0-react';
import {getLanguageClass, mapLanguageCode} from "../../utils/helperFunctions.jsx";
import PaginationComponent from "../commons/pagination/PaginationComponent.jsx";

export const fetchsheet = async (limit, skip, sort_order) => {
    const storedLanguage = localStorage.getItem(LANGUAGE);
    const language = storedLanguage ? mapLanguageCode(storedLanguage) : "bo";
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

    const handlePageChange = (pageNumber) => {
      setPagination(prev => ({ ...prev, currentPage: pageNumber }));
    };
    const handleSortChange = (e) => {
      setSortOrder(e.target.value);
    };
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
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
    <div className='container-community'>
      <div className='sheet-community'>
        <div className='community-header'>
        <h2 className='section-title listtitle'> {t("community.sheets.recently_published")}</h2>
          <select
            className="community-dropdown navbaritems"
            value={sortOrder}
            onChange={handleSortChange}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
       
        <div className='published-list'>
        <div className="sheets-list">
                    {sheetsIsLoading ? (
                      <p>Loading sheets...</p>
                    ) : (
                      sheetsData?.sheets.map((sheet) => (
                        <div key={sheet.id} className="sheet-item">
                          <div className="sheet-content">
                          <Link to={`/${encodeURIComponent(sheet.publisher.username)}/${sheet.title.replace(/\s+/g, '-').toLowerCase()}_${sheet.id}`}>
                            <div className='sheet-title-container'>
                            <h4 className={`sheet-title listtitle ${getLanguageClass(sheet.language)}`}>{sheet.title}</h4>
                            <p className=' navbaritems'>{sheet.summary}</p>
                            </div>
                            </Link>
                            <div className="sheet-metadata content">
                                {sheet.publisher.avatar_url ? (
                            <img src={sheet.publisher.avatar_url} alt={sheet.publisher.name.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()} className='avatar-image' />
                         ) : (
                         <div className="avatar-initials">
                              {sheet.publisher.name.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
                         </div>
                         )}
                         <div className='sheet-publisher-name'>{sheet.publisher.name}</div>
                         <span className="sheet-dot">·</span>
                         <span className="sheet-date ">{sheet.time_passed}</span>
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
        </div>
      </div>

      <div className='sidebar-community'>
        <div className='sidebar-section'>
          <div className='sidebar-content navbaritems'>
            <p>{t("side_nav.join_conversation.descriptions")}</p>
            <button className='make-sheet-btn navbaritems' onClick={() => 
              userIsLoggedIn ?(sessionStorage.removeItem('sheets-content'),sessionStorage.removeItem('sheet-title'), navigate("/sheets/new")) : navigate("/login")}>
              <span className='btn-icon'></span>
              {t("side_nav.join_conversation.button.make_sheet")}
            </button>
          </div>
        </div>

        <div className='sidebar-section '>
          <h3 className='sidebar-title listtitle'>{t("side_nav.who_to_follow")}</h3>
          <div className='follow-list'>
            
          </div>
        </div>

        <div className='sidebar-section'>
          <h3 className='sidebar-title listtitle'>{t("collection")}</h3>
          <p className='collections-description navbaritems'>
{            t("side_nav.collection.description")
}          </p>
          <button className='explore-collections-btn navbaritems'>
            <span className='btn-icon'></span>
           {t("side_nav.explore_collections")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;