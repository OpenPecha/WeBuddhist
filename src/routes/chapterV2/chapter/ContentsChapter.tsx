import React, { useState, useMemo, useEffect, useCallback } from "react";
import { VIEW_MODES, LAYOUT_MODES } from "../utils/header/view-selector/ViewSelector.js";
import { LAYOUT_MODE, siteName } from "../../../utils/constants.js";
import UseChapterHook from "./helpers/UseChapterHook.js";
import axiosInstance from "../../../config/axios-config.js";
import { useInfiniteQuery } from "react-query";
import { PanelProvider } from '../../../context/PanelContext.js';
import { getEarlyReturn, getFirstSegmentId, getLastSegmentId, mergeSections } from "../../../utils/helperFunctions.js";
import Seo from "../../commons/seo/Seo.js";
import { useTranslate } from "@tolgee/react";

const fetchContentDetails = async ({ pageParam = null, queryKey }) => {
  const [_, textId, contentId, versionId, size, initialSegmentId] = queryKey;
  const segmentId = pageParam?.segmentId ?? initialSegmentId;
  const direction = pageParam?.direction ?? "next";
  const { data } = await axiosInstance.post(`/api/v1/texts/${textId}/details`, {
    ...(contentId && { content_id: contentId }),
    ...(segmentId && { segment_id: segmentId }),
    ...(versionId && { version_id: versionId }),
    direction,
    size,
  });
  return data;
};

const ContentsChapter = ({ textId, contentId, segmentId, isFromSheet = false, versionId, addChapter, removeChapter, currentChapter, totalChapters, setVersionId }) => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.SOURCE);
  const [layoutMode, setLayoutMode] = useState(() => {
    const stored = localStorage.getItem(LAYOUT_MODE);
    if (stored === LAYOUT_MODES.PROSE || stored === LAYOUT_MODES.SEGMENTED) {
      return stored;
    }
    return LAYOUT_MODES.SEGMENTED;
  });
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [currentSegmentId, setCurrentSegmentId] = useState(segmentId)
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [scrollTrigger, setScrollTrigger] = useState(0);
  const size = 20;

  useEffect(() => {
    if (versionId) {
      setViewMode(VIEW_MODES.SOURCE_AND_TRANSLATIONS);
    } else {
      setViewMode(VIEW_MODES.SOURCE);
    }
  }, [versionId]);

  useEffect(() => {
    setCurrentSegmentId(segmentId);
  }, [segmentId]);
  const { t } = useTranslate();

  useEffect(() => {
      localStorage.setItem(LAYOUT_MODE, layoutMode);
  }, [layoutMode]);

  const infiniteQuery = useInfiniteQuery(
    ["content", textId, contentId, versionId, size, currentSegmentId],
    fetchContentDetails,
    {
      getNextPageParam: isFromSheet ? undefined : (lastPage) => {
        if (lastPage?.current_segment_position === lastPage?.total_segments) return null;
        const lastSegmentId = getLastSegmentId(lastPage.content.sections);
        return { segmentId: lastSegmentId, direction: "next" };
      },
      getPreviousPageParam: isFromSheet ? undefined : (firstPage) => {
        if (firstPage?.current_segment_position === 1) return null;
        const firstSegmentId = getFirstSegmentId(firstPage.content.sections);
        return { segmentId: firstSegmentId, direction: "previous" };
      },
      enabled: !!textId,
      refetchOnWindowFocus: false,
    }
  );

  // Merge all loaded sections for rendering
  const allContent = useMemo(() => {
    if (!infiniteQuery?.data?.pages || infiniteQuery.data.pages.length === 0) return null;
    let mergedSections = [];
    let text_detail = infiniteQuery.data.pages[0]?.text_detail;

    infiniteQuery.data.pages.forEach((page, index) => {
      mergedSections = index === 0 ? page.content.sections : mergeSections(mergedSections, page.content.sections);
    });
    return {
      content: { ...infiniteQuery.data.pages[0].content, sections: mergedSections },text_detail};
  }, [infiniteQuery.data?.pages]);

  const handleSegmentNavigate = useCallback((newSegmentId) => {
    setCurrentSegmentId(newSegmentId);
    setScrollTrigger(prev => prev + 1);
  }, []);

  const handleCurrentSectionChange = useCallback((sectionId) => {
    setCurrentSectionId(sectionId);
  }, []);

  // ----------------------------- helpers ---------------------------------------
  const siteBaseUrl = window.location.origin;
  const canonicalUrl = `${siteBaseUrl}${window.location.pathname}`;
  const pageTitle = allContent?.text_detail?.title ? `${allContent.text_detail.title} | ${siteName}` : `Chapter | ${siteName}`;
  const earlyReturn = getEarlyReturn({ isLoading: infiniteQuery.isLoading, error: infiniteQuery.error, t });
  if (earlyReturn) return earlyReturn;
  const canShowTableOfContents = ((allContent?.content?.sections || []).length) > 1;
  
  // ------------------------ renderers ----------------------
  const renderChapter = () => {
    const propsForUseChapterHookComponent = {
      textId,
      showTableOfContents: showTableOfContents && canShowTableOfContents,
      setShowTableOfContents,
      content: allContent?.content,
      language: allContent?.text_detail?.language,
      viewMode,
      layoutMode,
      addChapter,
      currentChapter,
      setVersionId,
      handleSegmentNavigate,
      infiniteQuery,
      onCurrentSectionChange: handleCurrentSectionChange,
      currentSectionId,
      currentSegmentId,
      scrollTrigger,
      textdetail: allContent?.text_detail,
      removeChapter,
      totalChapters,
      canShowTableOfContents,
      setViewMode,
      setLayoutMode
    };
    return (
        <UseChapterHook {...propsForUseChapterHookComponent} />
    );
  }

  return (
    <div className={`contents-chapter-container ${totalChapters > 1 ? 'split-screen' : 'single-chapter'}`}>
      <Seo
        title={pageTitle}
        description="Read chapter content with source and translations."
        canonical={canonicalUrl}
      />
      <PanelProvider>
        {renderChapter()}
      </PanelProvider>
    </div>
  )
}

export default React.memo(ContentsChapter);