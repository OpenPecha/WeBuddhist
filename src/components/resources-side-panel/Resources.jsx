import {getLanguageClass, LANGUAGE, mapLanguageCode, menuItems} from "../../utils/Constants.js";
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
export const fetchtranslationdata=async(segment_id,skip=0,limit=10)=>{
  const {data} = await axiosInstance.get(`/api/v1/segments/${segment_id}/translations`, {
    params: {
      segment_id,
      skip,
      limit
    }
  });
  return data;
}
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
const Resources = ({textId, segmentId, showPanel, setShowPanel}) => {
  const [isShareView, setIsShareView] = useState(false);
  const [isTranslationView, setIsTranslationView] = useState(false);
  const [isCommentaryView, setIsCommentaryView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedCommentaries, setExpandedCommentaries] = useState({});

  const {t} = useTranslate();

  const {data: sidePanelData} = useQuery(
    ["sidePanel", textId],
    () => fetchSidePanelData(textId),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20
    }
  );
  const {data: sidepaneltranslation} = useQuery(
    ["sidePaneltranslation",segmentId],
    () => fetchtranslationdata("2353849b-f8fa-43e4-850d-786b623d0130"), //send segmentId later todo
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


  const languageMap = {
    "zh": "language.sanskrit",
    "bo": "language.tibetan",
    "en": "language.english",
    "ja": "language.japanese",
    "ko": "language.korean",
    "fr": "language.french",
    "de": "language.german",
    "bhu":"language.bhutanese",
    "mo":"language.mongolian",
    "sp":"language.spanish"
  }
  const renderShareView = () => {
    return (
      <div>
        <div className="headerthing">
          <p className='mt-4 px-4 listtitle'>{t('panel.resources')}</p>
          <IoMdClose
            size={24}
            onClick={() => setIsShareView(false)}
            className="close-icon"
          />
        </div>
        <div className="share-content p-3">
          <p className="mb-3 textgreat ">{t('text.share_link')}</p>
          <div className="share-url-container p-3 mb-3">
            <p className="share-url text-truncate">{sidePanelData?.text_infos?.short_url}</p>
            <button
              className="copy-button"
              onClick={() => {
                navigator.clipboard.writeText(sidePanelData?.text_infos?.short_url);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 3000);
              }}
            >
              {copied ? <IoMdCheckmark size={16}/> : <IoCopy size={16}/>}
            </button>
          </div>
          <p className="textgreat">{t('text.more_options')}</p>
          <div className="social-share-buttons">
            <p className="social-button">
              <BsFacebook className="social-icon"/>{t('common.share_on_fb')}
            </p>
            <p className="social-button">
              <BsTwitter className="social-icon"/>{t('common.share_on_x')}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderTranslationView = () => {
    const groupedTranslations = sidepaneltranslation?.translations?.reduce((acc, translation) => {
      if (!acc[translation.language]) {
        acc[translation.language] = [];
      }
      acc[translation.language].push(translation);
      return acc;
    }, {});
    return (
      <div>
        <div className="headerthing">
          <p className='mt-4 px-4 listtitle'>{t('connection_pannel.translations')}</p>
          <IoMdClose
            size={24}
            onClick={() => setIsTranslationView(false)}
            className="close-icon"
          />
        </div>
        <div className="translation-content p-4">
          <div className="translations-list">
            {groupedTranslations && Object.entries(groupedTranslations).map(([language, translations]) => (
              <div key={language} className="language-group">
                <h3 className="language-title navbaritems">
                  {t(languageMap[language])} <span className="translation-count">({translations.length})</span>
                </h3>
                {translations.map((translation, index) => (
                  <div key={index} className="translation-item">
                    <span className={`translation-content ${getLanguageClass(translation.language)}`}>
                      <div dangerouslySetInnerHTML={{__html: translation.content}} />
                    </span>
                    <div className={` belowdiv navbaritems ${getLanguageClass(translation.language)}`}>                    
                    <p> {translation?.title ? translation.title : ""}</p>                 
                     <p> {t("connection_panel.menuscript.source")}:  {translation?.source ? translation.source : ""}</p>
                       <p>{t("text.versions.information.review_history")}</p> 
                        <div className=" linkselect">
                          <div className="linkicons">
                          <GoLinkExternal/>
                          {t("text.translation.open_text")}
                          </div>
                          <p className="selectss">{t("common.select")}</p>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
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