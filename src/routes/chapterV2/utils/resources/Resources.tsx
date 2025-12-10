import { useQuery } from "react-query";
import { IoMdClose } from "react-icons/io";
import { IoLanguage, IoNewspaperOutline } from "react-icons/io5";
import { BiSearch, BiBookOpen } from "react-icons/bi";
import { useState } from "react";
import { useTranslate } from "@tolgee/react";
import ShareView from "./components/share-view/ShareView.tsx";
import TranslationView from "./components/translation-view/TranslationView.tsx";
import CommentaryView from "./components/related-texts/RelatedTexts.tsx";
import RootTextView from "./components/root-texts/RootText.tsx";
import axiosInstance from "../../../../config/axios-config.ts";
import { usePanelContext } from "../../../../context/PanelContext.tsx";
import { MENU_ITEMS } from "../../../../utils/constants.ts";
import IndividualTextSearch from "./components/individual-text-search/IndividualTextSearch.tsx";
import CompareText from "../compare-text/CompareText.tsx";
import { Button } from "@/components/ui/button";

type PanelContextValue = {
  isResourcesPanelOpen: boolean;
  closeResourcesPanel: () => void;
};

export const fetchSidePanelData = async (segmentId: string) => {
  const { data } = await axiosInstance.get(
    `/api/v1/segments/${segmentId}/info`,
  );
  return data;
};

const Resources = ({
  segmentId,
  addChapter,
  handleClose,
  currentChapter,
  setVersionId,
  handleSegmentNavigate,
}: any) => {
  const { isResourcesPanelOpen, closeResourcesPanel } =
    usePanelContext() as PanelContextValue;
  const showPanel = isResourcesPanelOpen;
  const [activeView, setActiveView] = useState("main");
  const isMainView = activeView === "main";
  const buttonLayoutClasses = isMainView
    ? "justify-center sm:justify-start text-center sm:text-left"
    : "justify-start text-left";
  const { t } = useTranslate();

  const { data: sidePanelData } = useQuery(
    ["sidePanel", segmentId],
    () => fetchSidePanelData(segmentId),
    {
      refetchOnWindowFocus: false,
    },
  );

  const handleClosePanel = () => {
    handleClose ? handleClose() : closeResourcesPanel();
    setActiveView("main");
  };

  const renderPanelHeader = () => (
    <div
      className={`sticky top-0 z-20 flex items-center bg-[#EDEDED] border-b border-[#e0e0e0] px-3 py-3 ${isMainView ? "justify-center sm:justify-between" : "justify-between"} relative`}
    >
      <p className="text-base font-medium text-gray-800">
        {t("panel.resources")}
      </p>
      <Button
        type="button"
        aria-label={t("common.close")}
        variant="secondary"
        size="icon-sm"
        onClick={handleClosePanel}
      >
        <IoMdClose size={20} />
      </Button>
    </div>
  );

  const renderAboutSection = () => (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setActiveView("search")}
        className="w-full flex justify-start"
      >
        <BiSearch className="mr-2 text-lg" />
        {t("connection_panel.search_in_this_text")}
      </Button>
    </>
  );

  const renderTranslationsSection = () =>
    sidePanelData?.segment_info?.translations > 0 && (
      <Button
        type="button"
        variant="ghost"
        onClick={() => setActiveView("translation")}
        className="w-full flex justify-start"
      >
        <IoLanguage className="mr-2 text-lg" />
        {`${t("connection_pannel.translations")} (${sidePanelData.segment_info.translations})`}
      </Button>
    );

  const renderCommentaryButton = () =>
    sidePanelData?.segment_info?.related_text?.commentaries > 0 && (
      <Button
        type="button"
        variant="ghost"
        className="w-full flex justify-start"
        onClick={() => setActiveView("commentary")}
      >
        <BiBookOpen className="mr-2 text-lg" />
        {`${t("text.commentary")} (${sidePanelData.segment_info.related_text.commentaries})`}
      </Button>
    );

  const renderRootTextButton = () =>
    sidePanelData?.segment_info?.related_text?.root_text > 0 && (
      <Button
        type="button"
        variant="ghost"
        className="w-full flex justify-start"
        onClick={() => setActiveView("root_text")}
      >
        <BiBookOpen className="mr-2 text-lg" />
        {`${t("text.root_text")} (${sidePanelData.segment_info.related_text.root_text})`}
      </Button>
    );

  const renderRelatedTextsSection = () => {
    const hasCommentaries =
      sidePanelData?.segment_info?.related_text?.commentaries > 0;
    const hasRootTexts =
      sidePanelData?.segment_info?.related_text?.root_text > 0;

    return (
      sidePanelData?.segment_info?.related_text &&
      (hasCommentaries || hasRootTexts) && (
        <>
          <p className="text-great w-full border-b border-[#f0f0f0] text-sm font-medium text-gray-500">
            {t("text.related_texts")}
          </p>
          <div className="related-texts-container flex flex-col gap-2">
            {renderCommentaryButton()}
            {renderRootTextButton()}
          </div>
        </>
      )
    );
  };

  const renderResourcesSection = () =>
    sidePanelData?.segment_info?.resources?.sheets > 0 && (
      <>
        <p className="w-full border-b border-[#f0f0f0] text-sm font-medium text-gray-500">
          {t("panel.resources")}
        </p>
        <p
          className={`flex w-full items-center py-3 text-gray-700 transition hover:text-gray-600 hover:bg-gray-50 ${isMainView ? "justify-center sm:justify-start text-center sm:text-left" : "justify-start"}`}
        >
          <IoNewspaperOutline className="mr-2 text-lg" />
          {`${t("common.sheets")} (${sidePanelData.segment_info.resources.sheets})`}
        </p>
      </>
    );

  const handleMenuItemClick = (item: any) => {
    if (item.label === "common.share") {
      setActiveView("share");
    } else if (item.label === "connection_panel.compare_text") {
      setActiveView("compare_text");
    }
  };

  const renderMenuItems = () => (
    <>
      {MENU_ITEMS.filter(
        (item) =>
          item.label !== "sheet.add_to_sheet" &&
          item.label !== "connection_panel.notes",
      ).map((item) => (
        <Button
          type="button"
          variant="ghost"
          key={item.label}
          className="w-full flex justify-start"
          onClick={() => handleMenuItemClick(item)}
        >
          {item.icon && <item.icon className="mr-2 text-lg" />}
          {t(`${item.label}`)}
        </Button>
      ))}
    </>
  );

  const renderMainPanel = () => (
    <>
      {renderPanelHeader()}
      <div
        className={`p-4 transition-opacity duration-300 ${showPanel ? "opacity-100" : "opacity-0 sm:opacity-0 lg:opacity-100"} ${isMainView ? "text-center sm:text-left" : "text-left"}`}
      >
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
        return (
          <CompareText
            setIsCompareTextView={setActiveView}
            addChapter={addChapter}
            currentChapter={currentChapter}
            handleNavigate={() => setActiveView("main")}
          />
        );
      case "root_text":
        return (
          <RootTextView
            segmentId={segmentId}
            setIsRootTextView={setActiveView}
            addChapter={addChapter}
            currentChapter={currentChapter}
            handleNavigate={() => setActiveView("main")}
          />
        );
      default:
        return renderMainPanel();
    }
  };

  return (
    <>
      <div
        className={`flex flex-col text-left bg-[#FBFBFA] transition-all duration-300 overflow-y-auto ${showPanel ? "block" : "hidden"}  fixed inset-x-0 bottom-0 h-[45vh] w-full border-t border-gray-200 bg-white z-1500 lg:static lg:h-full lg:min-w-[420px] lg:w-[350px] lg:max-w-full lg:bg-[#FBFBFA] lg:shadow-none lg:translate-x-0 lg:transform-none lg:z-auto xl:w-[580px] ${isMainView ? "is-main" : ""}`}
      >
        {renderSidePanel()}
      </div>
    </>
  );
};

export default Resources;
