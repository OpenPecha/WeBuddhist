import {LANGUAGE, mapLanguageCode, menuItems} from "../../utils/Constants.js";
import axiosInstance from "../../config/axios-config.js";
import {useQuery} from "react-query";

import {IoMdCheckmark, IoMdClose} from "react-icons/io";
import {IoCopy, IoLanguage, IoNewspaperOutline, IoAddCircleOutline, IoShareSocialSharp} from "react-icons/io5";
import {BsFacebook, BsTwitter, BsWindowFullscreen} from "react-icons/bs";

import {FiInfo, FiList} from "react-icons/fi";
import {BiSearch, BiBookOpen} from "react-icons/bi";
import {useState} from "react";
import {useTranslate} from "@tolgee/react";

import "./Resources.scss"
import { GoLinkExternal } from "react-icons/go";
export const fetchCommentaryData = async(segment_id, skip=0, limit=10) => {
  
  try {
    const {data} = await axiosInstance.get(`/api/v1/segments/${segment_id}/commentaries`, {
      params: {
        skip,
        limit
      }
    });
    return data;
  } catch (error) {
    return { commentaries: [] };
  }
}

import ShareView from "./components/share-view/ShareView.jsx";
import TranslationView from "./components/translation-view/TranslationView.jsx";


export const fetchSidePanelData = async (text_id) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const {data} = await axiosInstance.get(`/api/v1/texts/${text_id}/infos`, {
    params: {
      language,
      text_id
    }
  });
  return data;
};
const Resources = ({textId, segmentId, showPanel, setShowPanel, setVersionId, versionId}) => {
  const [isShareView, setIsShareView] = useState(false);
  const [isTranslationView, setIsTranslationView] = useState(false);
  const [isCommentaryView, setIsCommentaryView] = useState(false);
  const [expandedCommentaries, setExpandedCommentaries] = useState({});
  const [expandedTranslations, setExpandedTranslations] = useState({});


  const {t} = useTranslate();

  const {data: sidePanelData} = useQuery(
    ["sidePanel", textId],
    () => fetchSidePanelData(textId),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20
    }
  );

  const {data: segmentCommentaries} = useQuery(
    ["sidePanelcommentary", segmentId],
    () => fetchCommentaryData("2353849b-f8fa-43e4-850d-786b623d0130"), 
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20
    }
  );
  const toggleCommentary = (commentaryId) => {
    setExpandedCommentaries(prev => ({
      ...prev,
      [commentaryId]: !prev[commentaryId]
    }));
  };



  const renderShareView = () => {
    return (
      <ShareView 
        sidePanelData={sidePanelData} 
        setIsShareView={setIsShareView} 
      />
    );
  };

  const renderTranslationView = () => {
    return (
      <TranslationView 
        segmentId={segmentId}
        setIsTranslationView={setIsTranslationView}
        expandedTranslations={expandedTranslations}
        setExpandedTranslations={setExpandedTranslations}
        setVersionId={setVersionId}
        versionId={versionId}
      />
    );
  };

  const renderCommentaryView = () => {
    return (
      <div>
        <div className="headerthing">
          <p className="mt-4 px-4 listtitle">
            {t("text.commentary")}
            {segmentCommentaries?.commentaries?.length > 0 ? 
              ` (${segmentCommentaries.commentaries.length})` : ''}
          </p>
          <IoMdClose
            size={24}
            onClick={() => setIsCommentaryView(false)}
            className="close-icon"
          />
        </div>
        <div className="translation-content p-4">
          <div className="commentaries-list">
            {(!segmentCommentaries || !segmentCommentaries.commentaries || 
              segmentCommentaries.commentaries.length === 0) && (
              <div className="no-commentaries-message p-4 text-center">
                <p>{t("text.no_commentary")}</p>
              </div>
            )}
            
            {segmentCommentaries && segmentCommentaries.commentaries && 
             segmentCommentaries.commentaries.length > 0 && (
              <div className="all-commentaries">
                {segmentCommentaries.commentaries.map((commentary, index) => {
                  const commentaryId = commentary.text_id;
                  const isExpanded = expandedCommentaries[commentaryId];
                  
                  return (
                    <div key={commentaryId} className="commentary-list-item">
                      <h3 className={`commentary-title ${getLanguageClass(commentary.language)}`}>
                        {commentary.title} {commentary.count && `(${commentary.count})`}
                      </h3>
                      
                      {commentary.content && (
                        <div className="commentary-container">
                          <div 
                            className={`commentary-content ${getLanguageClass(commentary.language)} ${isExpanded ? '' : 'content-truncated'}`}
                          >
                            <div 
                              dangerouslySetInnerHTML={{ __html: commentary.content }}
                            />
                          </div>
                          
                          <div className="see-more-container">
                            <button 
                              className="see-more-link" 
                              onClick={() => toggleCommentary(commentaryId)}
                            >
                              {isExpanded ? t('panel.showless') : t('panel.showmore')} 
                            </button>
                          </div>
                          
                          <div className="commentary-actions">
                            <div className="commentary-buttons">
                              <div className="commentary-button">
                                <GoLinkExternal size={14} className="mr-1"/>
                                <span>{t("text.translation.open_text")}</span>
                              </div>
                              
                              <div className="commentary-button">
                                <IoAddCircleOutline size={14} className="mr-1"/>
                                <span>{t("sheet.add_to_sheet")}</span>
                              </div>
                              
                              <div className="commentary-button">
                                <IoShareSocialSharp size={14} className="mr-1"/>
                                <span>{t("common.share")}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSidePanel = () => {
    return (
      <div className={`right-panel navbaritems ${showPanel ? 'show' : ''}`}>
        <div>
          {isShareView ? renderShareView() : isTranslationView ? renderTranslationView() : isCommentaryView ? renderCommentaryView() : (
            <>
              <div className="headerthing">
                <p className='mt-4 px-4 listtitle'>{t('panel.resources')}</p>
                <IoMdClose
                  size={24}
                  onClick={() => setShowPanel(false)}
                  className="close-icon"
                />
              </div>
              <div className="panel-content p-3">
                <p><FiInfo className="m-2"/> {t("side_nav.about_text")}</p>
                <p><FiList className='m-2'/>{t("text.table_of_contents")}</p>
                <p><BiSearch className='m-2'/>{t("connection_panel.search_in_this_text")}</p>

                {sidePanelData?.text_infos?.translations > 0 && (
                  <p onClick={() => setIsTranslationView(true)}>
                    <IoLanguage className="m-2"/>
                    {`${t("connection_pannel.translations")} (${sidePanelData.text_infos.translations})`}
                  </p>
                )}

                {sidePanelData?.text_infos?.related_texts?.length > 0 && (
                  <>
                    <p className='textgreat'>{t("text.related_texts")}</p>
                    <div className='related-texts-container'>
                      {sidePanelData.text_infos.related_texts.map((data, index) => (
                        <p key={index} className='related-text-item' onClick={() => setIsCommentaryView(true)}>
                          <BiBookOpen className="m-2"/>
                          {`${data.title} (${data.count})`}
                        </p>
                      ))}
                    </div>
                  </>
                )}

                {sidePanelData?.text_infos?.sheets > 0 && (
                  <>
                    <p className='textgreat'>{t("panel.resources")}</p>
                    <p>
                      <IoNewspaperOutline className="m-2"/>
                      {` ${t("common.sheets")} (${sidePanelData.text_infos.sheets})`}
                    </p>
                  </>
                )}

                {sidePanelData?.text_infos?.web_pages > 0 && (
                  <p>
                    <BsWindowFullscreen className="m-2"/>
                    {` ${t("text.web_pages")} (${sidePanelData.text_infos.web_pages})`}
                  </p>
                )}

                {menuItems.map((item) => (
                  <div
                    key={item.label}
                    className={item.isHeader ? 'textgreat' : ' '}
                    onClick={() => {
                      if (item.label === 'common.share') {
                        setIsShareView(true);
                      }
                    }}
                  >
                    <p>
                      {item.icon && <item.icon className='m-2'/>}
                      {t(`${item.label}`)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };
  return(
    renderSidePanel()
  )
}

export default Resources;