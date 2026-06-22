import { useQuery } from "react-query";
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
import { Button } from "@/components/ui/button";
import ResourceHeader from "./components/common/ResourceHeader.tsx";
import CompareText from "./components/compare-text/CompareText.tsx";

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
  const { t } = useTranslate();
  const storedLanguage = localStorage.getItem("language");

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

  const renderTranslationsSection = () =>
    sidePanelData?.segment_info?.translations > 0 && (
      <Button
        type="button"
        variant="ghost"
        onClick={() => setActiveView("translation")}
        className="w-full flex justify-start gap-1.5"
      >
        <IoLanguage className="text-lg" />
        {`${t("connection_pannel.translations")} (${sidePanelData.segment_info.translations})`}
      </Button>
    );

  const renderCommentaryButton = () =>
    sidePanelData?.segment_info?.related_text?.commentaries > 0 && (
      <Button
        type="button"
        variant="ghost"
        className="w-full flex justify-start gap-1.5"
        onClick={() => setActiveView("commentary")}
      >
        <BiBookOpen className="text-lg" />
        {`${t("text.commentary")} (${sidePanelData.segment_info.related_text.commentaries})`}
      </Button>
    );

  const renderRootTextButton = () =>
    sidePanelData?.segment_info?.related_text?.root_text > 0 && (
      <Button
        type="button"
        variant="ghost"
        className="w-full flex justify-start gap-1.5"
        onClick={() => setActiveView("root_text")}
      >
        <BiBookOpen className="text-lg" />
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
          <p className="w-full border-b border-[#f0f0f0] text-sm font-medium text-gray-500">
            {t("text.related_texts")}
          </p>
          <div className="flex flex-col gap-2">
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
          className={`flex w-full items-center py-3 text-gray-700 transition hover:text-gray-600 hover:bg-gray-50 justify-start`}
        >
          <IoNewspaperOutline className="text-lg" />
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
      <p className="w-full border-b border-[#f0f0f0] text-sm font-medium text-gray-500">
        {t("connection_panel.tools")}
      </p>
      {MENU_ITEMS.map((item) => (
        <Button
          type="button"
          variant="ghost"
          key={item.label}
          className="w-full flex justify-start gap-1.5"
          onClick={() => handleMenuItemClick(item)}
        >
          <item.icon className="text-lg" />
          {t(`${item.label}`)}
        </Button>
      ))}
    </>
  );

  const renderMainPanel = () => (
    <>
      <ResourceHeader title={t("panel.resources")} onClose={handleClosePanel} />
      <div className="text-left p-4 space-y-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setActiveView("search")}
          className="w-full flex justify-start"
        >
          <BiSearch
            className={`text-lg ${storedLanguage === "bo-IN" ? "-translate-y-0.5" : ""}`}
          />
          {t("connection_panel.search_in_this_text")}
        </Button>
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
        className={`flex lg:w-[550px] md:w-[350px] flex-col text-left bg-navbar transition-all duration-300 overflow-y-auto ${showPanel ? "block" : "hidden"} w-full h-full border-custom-border overalltext`}
      >
        {renderSidePanel()}
      </div>
    </>
  );
};

export default Resources;
