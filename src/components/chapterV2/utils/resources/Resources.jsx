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
import axiosInstance from "../../../../config/axios-config.js";
import {usePanelContext} from "../../../../context/PanelContext.jsx";
import {MENU_ITEMS} from "../../../../utils/constants.js";
import PropTypes from "prop-types";
import IndividualTextSearch from "./components/individual-text-search/IndividualTextSearch.jsx";
import "./Resources.scss"

export const fetchSidePanelData = async (segmentId) => {
  const {data} = await axiosInstance.get(`/api/v1/segments/${segmentId}/info`);
  return data;
};

const Resources = ({segmentId, addChapter, handleClose, currentChapter, setVersionId, handleSegmentNavigate}) => {
  const { isResourcesPanelOpen, closeResourcesPanel } = usePanelContext();
  const showPanel = isResourcesPanelOpen;
  const [expandedCommentaries, setExpandedCommentaries] = useState({});
  const [expandedTranslations, setExpandedTranslations] = useState({});
  const [expandedRootTexts, setExpandedRootTexts] = useState({});
  const [activeView, setActiveView] = useState("main");
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
          }}
          className="close-icon"
        />
      </div>
      <div className="panel-content p-3">
        <p><FiInfo className="m-2"/> {t("side_nav.about_text")}</p>
        <button onClick={() => setActiveView("search")} >
          <BiSearch className='m-2'/>{t("connection_panel.search_in_this_text")}
        </button>

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
            segmentId={segmentId}
            setIsShareView={setActiveView}
          />
        );
      case "search":
        return (
          <IndividualTextSearch
            onClose={() => setActiveView("main")}
            textId={sidePanelData?.segment_info?.text_id}
            handleSegmentNavigate={handleSegmentNavigate}
          />
        );
      case "translation":
        return (
          <TranslationView
            segmentId={segmentId}
            setIsTranslationView={setActiveView}
            expandedTranslations={expandedTranslations}
            setExpandedTranslations={setExpandedTranslations}
            addChapter={addChapter}
            currentChapter={currentChapter}
            setVersionId={setVersionId}
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
            currentChapter={currentChapter}
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
            currentChapter={currentChapter}
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
  addChapter: PropTypes.func,
  handleClose: PropTypes.func,
  currentChapter: PropTypes.object,
  setVersionId: PropTypes.func,
  handleSegmentNavigate: PropTypes.func,
}