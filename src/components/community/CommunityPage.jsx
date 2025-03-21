import React, { useMemo, useState } from 'react';
import "./CommunityPage.scss";
import { useTranslate } from '@tolgee/react';
import { LANGUAGE, mapLanguageCode } from '../../utils/Constants';
import { useQuery } from 'react-query';
import axiosInstance from '../../config/axios-config.js';

export const fetchsheet = async (userid="", limit, skip) => {
    const storedLanguage = localStorage.getItem(LANGUAGE);
    const language = storedLanguage ? mapLanguageCode(storedLanguage) : "bo";
    const { data } = await axiosInstance.get("api/v1/sheets", {
      params: {
        language,
        ...(userid && { user_id: userid }),
        limit,
        skip,
      },
    });
  
    return data;
  };
const CommunityPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
      const skip = useMemo(() =>{
        return (currentPage - 1) * limit;
      },[currentPage])
    const {t}=useTranslate();


  const { 
    data: sheetsData, 
    isLoading: sheetsIsLoading 
  } = useQuery(
    ["sheets", currentPage, limit], 
    () => fetchsheet("tenzin_tsering.7233", limit, skip), 
    { refetchOnWindowFocus: false }
  );

  return (
    <div className='container-community'>
      <div className='sheet-community'>
        <h2 className='section-title listtitle'> {t("community.sheets.recently_published")}</h2>
        
        <div className='published-list'>
        <div className="sheets-list">
                    {sheetsIsLoading ? (
                      <p>Loading sheets...</p>
                    ) : (
                      sheetsData?.sheets.map((sheet) => (
                        <div key={sheet.id} className="sheet-item">
                          <div className="sheet-content ">
                            <h4 className="sheet-title listtitle">{sheet.title}</h4>
                            <p className=' navbaritems'>{sheet.summary}</p>
                            <div className="sheet-metadata content">
                                {sheet.publisher.image_url ? (
                            <img src={sheet.publisher.image_url} alt={sheet.publisher.name} />
                         ) : (
                         <div className="avatar-initials">
                              {sheet.publisher.name.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
                         </div>
                         )}
                         <span className="sheet-dot">·</span>
                         <span className="sheet-date ">{sheet.published_time}</span>
                        </div>
                          </div>
                        </div>
                      ))
                    )}
      </div>
        </div>
      </div>

      <div className='sidebar-community'>
        <div className='sidebar-section'>
          <div className='sidebar-content navbaritems'>
            <p>{t("side_nav.join_conversation.descriptions")}</p>
            <button className='make-sheet-btn navbaritems'>
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