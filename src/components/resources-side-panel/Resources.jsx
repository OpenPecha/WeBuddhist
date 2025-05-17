import {LANGUAGE, mapLanguageCode, menuItems} from "../../utils/Constants.js";
import { resetOgMetaTags } from "../../utils/metaTagUtils.js";
import axiosInstance from "../../config/axios-config.js";
import {useQuery} from "react-query";
import {IoMdClose} from "react-icons/io";
import { IoLanguage, IoNewspaperOutline,} from "react-icons/io5";
import {FiInfo} from "react-icons/fi";
import {BiSearch, BiBookOpen} from "react-icons/bi";
import {useState, useEffect} from "react";
import {useTranslate} from "@tolgee/react";
import ShareView from "./components/share-view/ShareView.jsx";
import TranslationView from "./components/translation-view/TranslationView.jsx";
import CommentaryView from "./components/related-texts/RelatedTexts.jsx";
import RootTextView from "./components/root-texts/RootText.jsx";
import { usePanelContext } from "../../context/PanelContext.jsx";
import { useSearchParams } from "react-router-dom";
import "./Resources.scss"

export const fetchSidePanelData = async (segmentId) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const {data} = await axiosInstance.get(`/api/v1/segments/${segmentId}/infos`, {
    params: {
      language,
      segmentId
    }
  });
  return data;
};

const Resources = ({segmentId, setVersionId, versionId, addChapter, sectionindex, handleClose}) => {
  const { isResourcesPanelOpen, closeResourcesPanel } = usePanelContext();
  const showPanel = isResourcesPanelOpen;
  const [expandedCommentaries, setExpandedCommentaries] = useState({});
  const [expandedTranslations, setExpandedTranslations] = useState({});
  const [expandedRootTexts, setExpandedRootTexts] = useState({});
  const [activeView, setActiveView] = useState("main");
  const [searchParams, setSearchParams] = useSearchParams();


  const {t} = useTranslate();

  const {data: sidePanelData} = useQuery(
    ["sidePanel", segmentId],
    () => fetchSidePanelData(segmentId),
    {
      refetchOnWindowFocus: false,
    }
  );
  
  useEffect(() => {
    if (!segmentId) {
      resetOgMetaTags();
    }
  }, [segmentId]);

  const renderMainPanel = () => {
    return <>
      <div className="headerthing">
        <p className='mt-4 px-4 listtitle'>{t('panel.resources')}</p>
        <IoMdClose
          size={24}
          onClick={() => {
            handleClose ? handleClose() : closeResourcesPanel();
            setActiveView("main");
            if (searchParams.has('segment_id')) {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('segment_id');
              setSearchParams(newParams);
            }
          }}
          className="close-icon"
        />
      </div>
      <div className="panel-content p-3">
        <p><FiInfo className="m-2"/> {t("side_nav.about_text")}</p>
        <p><BiSearch className='m-2'/>{t("connection_panel.search_in_this_text")}</p>

        {sidePanelData?.segment_infos?.translations > 0 && (
          <p onClick={() => setActiveView("translation")}>
            <IoLanguage className="m-2"/>
            {`${t("connection_pannel.translations")} (${sidePanelData.segment_infos.translations})`}
          </p>
        )}

        {sidePanelData?.segment_infos.related_text && (sidePanelData?.segment_infos?.related_text?.commentaries > 0 || sidePanelData?.segment_infos?.related_text?.root_text > 0) && (
          <>
            <p className='textgreat'>{t("text.related_texts")}</p>
            <div className='related-texts-container'>
              {sidePanelData?.segment_infos?.related_text?.commentaries > 0 && (
                <p className='related-text-item' onClick={() => setActiveView("commentary")}>
                  <BiBookOpen className="m-2"/>
                  {`${t("text.commentary")} (${sidePanelData?.segment_infos?.related_text?.commentaries})`}
                </p>
              )}
              {sidePanelData?.segment_infos?.related_text?.root_text > 0 && (
                <p className='related-text-item' onClick={() => setActiveView("root_text")}>
                  <BiBookOpen className="m-2"/>
                  {`${t("text.root_text")} (${sidePanelData?.segment_infos?.related_text?.root_text})`}
                </p>
              )}
            </div>
          </>
        )}

        {sidePanelData?.segment_infos?.resources?.sheets > 0 && (
          <>
            <p className='textgreat'>{t("panel.resources")}</p>
            <p>
              <IoNewspaperOutline className="m-2"/>
              {` ${t("common.sheets")} (${sidePanelData?.segment_infos?.resources?.sheets})`}
            </p>
          </>
        )}

        {menuItems.map((item) => (
          <div
            key={item.label}
            className={item.isHeader ? 'textgreat' : ''}
            onClick={() => {
              if (item.label === 'common.share') {
                setActiveView("share");
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

  }

  const renderSidePanel = () => {
    switch (activeView) {
      case "share":
        return (
          <ShareView
            setIsShareView={setActiveView}
            segmentId={segmentId}
            language="bo"
          />
        );
      case "translation":
        return (
          <TranslationView
            segmentId={segmentId}
            setIsTranslationView={setActiveView}
            expandedTranslations={expandedTranslations}
            setExpandedTranslations={setExpandedTranslations}
            setVersionId={setVersionId}
            versionId={versionId}
            addChapter={addChapter}
            sectionindex={sectionindex}
          />
        );
      case "commentary":
        return (
          <CommentaryView
            segmentId={segmentId}
            setIsCommentaryView={setActiveView}
            expandedCommentaries={expandedCommentaries}
            setExpandedCommentaries={setExpandedCommentaries}
            addChapter={addChapter}
            sectionindex={sectionindex}
          />
        );
      case "root_text":
        return (
          <RootTextView
            segmentId={segmentId}
            setIsRootTextView={setActiveView}
            expandedRootTexts={expandedRootTexts}
            setExpandedRootTexts={setExpandedRootTexts}
            addChapter={addChapter}
            sectionindex={sectionindex}
          />
        );
      default:
        return renderMainPanel();
    }
  };

  return(
    <>
      {showPanel && <div className="panel-backdrop" onClick={() => closeResourcesPanel()}></div>}
      <div className={`right-panel navbaritems ${showPanel ? 'show' : ''}`}>
        {renderSidePanel()}
      </div>
    </>
  )
}

export default Resources;