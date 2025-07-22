import {useQuery} from "react-query";
import {IoMdClose} from "react-icons/io";
import { IoLanguage, IoNewspaperOutline,} from "react-icons/io5";
import {FiInfo} from "react-icons/fi";
import {BiSearch, BiBookOpen} from "react-icons/bi";
import {useState} from "react";
import {useTranslate} from "@tolgee/react";
import ShareView from "./components/share-view/ShareView.jsx";
import TranslationView from "./components/translation-view/TranslationView.jsx";
import CommentaryView from "./components/related-texts/RelatedTexts.jsx";
import RootTextView from "./components/root-texts/RootText.jsx";
import { useSearchParams } from "react-router-dom";
import "./Resources.scss"
import axiosInstance from "../../../../config/axios-config.js";
import {usePanelContext} from "../../../../context/PanelContext.jsx";
import {MENU_ITEMS, LANGUAGE} from "../../../../utils/constants.js";
import {mapLanguageCode} from "../../../../utils/helperFunctions.jsx";
import PropTypes from "prop-types";
import IndividualTextSearch from "./components/individual-text-search/IndividualTextSearch.jsx";

export const fetchSidePanelData = async (segmentId) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const {data} = await axiosInstance.get(`/api/v1/segments/${segmentId}/info`, {
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
        <p onClick={() => setActiveView("search")} >
          <BiSearch className='m-2'/>{t("connection_panel.search_in_this_text")}
        </p>

        {sidePanelData?.segment_info?.translations > 0 && (
          <button type="button" onClick={() => setActiveView("translation")}>
            <IoLanguage className="m-2"/>
            {`${t("connection_pannel.translations")} (${sidePanelData.segment_info.translations})`}
          </button>
        )}

        {sidePanelData?.segment_info?.related_text && (sidePanelData?.segment_info?.related_text?.commentaries > 0 || sidePanelData?.segment_info?.related_text?.root_text > 0) && (
          <>
            <p className='textgreat'>{t("text.related_texts")}</p>
            <div className='related-texts-container'>
              {sidePanelData?.segment_info?.related_text?.commentaries > 0 && (
                <button className='related-text-item' onClick={() => setActiveView("commentary")}>
                  <BiBookOpen className="m-2"/>
                  {`${t("text.commentary")} (${sidePanelData?.segment_info?.related_text?.commentaries})`}
                </button>
              )}
              {sidePanelData?.segment_info?.related_text?.root_text > 0 && (
                <button className='related-text-item' onClick={() => setActiveView("root_text")}>
                  <BiBookOpen className="m-2"/>
                  {`${t("text.root_text")} (${sidePanelData?.segment_info?.related_text?.root_text})`}
                </button>
              )}
            </div>
          </>
        )}

        {sidePanelData?.segment_info?.resources?.sheets > 0 && (
          <>
            <p className='textgreat'>{t("panel.resources")}</p>
            <p>
              <IoNewspaperOutline className="m-2"/>
              {` ${t("common.sheets")} (${sidePanelData?.segment_info?.resources?.sheets})`}
            </p>
          </>
        )}

        {MENU_ITEMS.map((item) => (
          <button
            type="button"
            key={item.label}
            className={item.isHeader ? 'textgreat' : ''}
            onClick={() => {
              if (item.label === 'common.share') {
                setActiveView("share");
              }
            }}
          >
            {item.icon && <item.icon className='m-2'/>}
            {t(`${item.label}`)}
          </button>
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
          />
        );
      case "search":
        return (
          <IndividualTextSearch
            onClose={() => setActiveView("main")}
            textId={sidePanelData?.segment_info?.text_id}
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
      {showPanel && <button className="panel-backdrop" onClick={() => closeResourcesPanel()}></button>}
      <div className={`right-panel navbaritems ${showPanel ? 'show' : ''}`}>
        {renderSidePanel()}
      </div>
    </>
  )
}

export default Resources;
Resources.propTypes = {
  segmentId: PropTypes.string.isRequired, 
  setVersionId: PropTypes.func, 
  versionId: PropTypes.string, 
  addChapter: PropTypes.func, 
  sectionindex: PropTypes.number, 
  handleClose: PropTypes.func
}