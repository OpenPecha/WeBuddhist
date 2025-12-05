import {useQuery} from "react-query";
import {IoMdClose} from "react-icons/io";
import { IoLanguage, IoNewspaperOutline,} from "react-icons/io5";
// import {FiInfo} from "react-icons/fi";
import {BiSearch, BiBookOpen} from "react-icons/bi";
import {useState} from "react";
import {useTranslate} from "@tolgee/react";
import ShareView from "./components/share-view/ShareView.tsx";
import TranslationView from "./components/translation-view/TranslationView.tsx";
import CommentaryView from "./components/related-texts/RelatedTexts.tsx";
import RootTextView from "./components/root-texts/RootText.tsx";
import axiosInstance from "../../../../config/axios-config.ts";
import {usePanelContext} from "../../../../context/PanelContext.tsx";
import {MENU_ITEMS} from "../../../../utils/constants.ts";
import IndividualTextSearch from "./components/individual-text-search/IndividualTextSearch.tsx";
import "./Resources.scss"
import CompareText from "../compare-text/CompareText.tsx";

export const fetchSidePanelData = async (segmentId) => {
  const {data} = await axiosInstance.get(`/api/v1/segments/${segmentId}/info`);
  return data;
};

const Resources = ({segmentId, addChapter, handleClose, currentChapter, setVersionId, handleSegmentNavigate}) => {
  const { isResourcesPanelOpen, closeResourcesPanel } = usePanelContext();
  const showPanel = isResourcesPanelOpen;
  const [activeView, setActiveView] = useState("main");
  const {t} = useTranslate();

  const {data: sidePanelData} = useQuery(
    ["sidePanel", segmentId],
    () => fetchSidePanelData(segmentId),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleClosePanel = () => {
    handleClose ? handleClose() : closeResourcesPanel();
    setActiveView("main");
  };

  const renderPanelHeader = () => (
    <div className="headerthing">
      <p className='mt-4 px-4 '>{t('panel.resources')}</p>
      <IoMdClose
        size={24}
        onClick={handleClosePanel}
        className="close-icon"
      />
    </div>
  );

  const renderAboutSection = () => (
    <>
      {/* <p><FiInfo className="m-2"/> {t("side_nav.about_text")}</p> */}
      <button onClick={() => setActiveView("search")}>
        <BiSearch className='m-2'/>{t("connection_panel.search_in_this_text")}
      </button>
    </>
  );

  const renderTranslationsSection = () => (
    sidePanelData?.segment_info?.translations > 0 && (
      <button type="button" onClick={() => setActiveView("translation")}>
        <IoLanguage className="m-2"/>
        {`${t("connection_pannel.translations")} (${sidePanelData.segment_info.translations})`}
      </button>
    )
  );

  const renderCommentaryButton = () => (
    sidePanelData?.segment_info?.related_text?.commentaries > 0 && (
      <button className='related-text-item' onClick={() => setActiveView("commentary")}>
        <BiBookOpen className="m-2"/>
        {`${t("text.commentary")} (${sidePanelData.segment_info.related_text.commentaries})`}
      </button>
    )
  );

  const renderRootTextButton = () => (
    sidePanelData?.segment_info?.related_text?.root_text > 0 && (
      <button className='related-text-item' onClick={() => setActiveView("root_text")}>
        <BiBookOpen className="m-2"/>
        {`${t("text.root_text")} (${sidePanelData.segment_info.related_text.root_text})`}
      </button>
    )
  );

  const renderRelatedTextsSection = () => {
    const hasCommentaries = sidePanelData?.segment_info?.related_text?.commentaries > 0;
    const hasRootTexts = sidePanelData?.segment_info?.related_text?.root_text > 0;

    return (
      sidePanelData?.segment_info?.related_text && (hasCommentaries || hasRootTexts) && (
        <>
          <p className='text-great'>{t("text.related_texts")}</p>
          <div className='related-texts-container'>
            {renderCommentaryButton()}
            {renderRootTextButton()}
          </div>
        </>
      )
    );
  };

  const renderResourcesSection = () => (
    sidePanelData?.segment_info?.resources?.sheets > 0 && (
      <>
        <p className='text-great'>{t("panel.resources")}</p>
        <p>
          <IoNewspaperOutline className="m-2"/>
          {` ${t("common.sheets")} (${sidePanelData.segment_info.resources.sheets})`}
        </p>
      </>
    )
  );

  const handleMenuItemClick = (item) => {
    if (item.label === 'common.share') {
      setActiveView("share");
    }else if (item.label === 'connection_panel.compare_text') {
      setActiveView("compare_text");
    }
  };

  const renderMenuItems = () => (
    <>
      {MENU_ITEMS
      .filter(item => 
        item.label !== 'sheet.add_to_sheet' && 
        item.label !== 'connection_panel.notes'
      )
      .map((item) => (
        <button
          type="button"
          key={item.label}
          className={item.isHeader ? 'text-great' : ''}
          onClick={() => handleMenuItemClick(item)}
        >
          {item.icon && <item.icon className='m-2'/>}
          {t(`${item.label}`)}
        </button>
      ))}
    </>
  );

  const renderMainPanel = () => (
    <>
      {renderPanelHeader()}
      <div className="panel-content p-3">
        {renderAboutSection()}
        {renderTranslationsSection()}
        {renderRelatedTextsSection()}
        {renderResourcesSection()}
        {renderMenuItems()}
      </div>
    </>
  );

  const renderSidePanel = () => {
    switch (activeView) {
      case "share":
        return (
          <ShareView
            segmentId={segmentId}
            setIsShareView={setActiveView}
            handleNavigate={() => setActiveView("main")}
          />
        );
      case "search":
        return (
          <IndividualTextSearch
            onClose={() => setActiveView("main")}
            textId={sidePanelData?.segment_info?.text_id}
            handleSegmentNavigate={handleSegmentNavigate}
            handleNavigate={() => setActiveView("main")}
          />
        );
      case "translation":
        return (
          <TranslationView
            segmentId={segmentId}
            setIsTranslationView={setActiveView}
            addChapter={addChapter}
            currentChapter={currentChapter}
            setVersionId={setVersionId}
            handleNavigate={() => setActiveView("main")}
          />
        );
      case "commentary":
        return (
          <CommentaryView
            segmentId={segmentId}
            setIsCommentaryView={setActiveView}
            addChapter={addChapter}
            currentChapter={currentChapter}
            handleNavigate={() => setActiveView("main")}
          />
        );
      case "compare_text": 
        return <CompareText setIsCompareTextView={setActiveView} addChapter={addChapter} currentChapter={currentChapter} handleNavigate={() => setActiveView("main")}/>;
      case "root_text":
        return (
          <RootTextView
            segmentId={segmentId}
            setIsRootTextView={setActiveView}
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
      <div className={`right-panel navbaritems ${showPanel ? 'show' : ''} ${activeView === 'main' ? 'is-main' : ''}`}>
        {renderSidePanel()}
      </div>
    </>
  )
}

export default Resources;