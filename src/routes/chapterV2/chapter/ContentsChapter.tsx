import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  VIEW_MODES,
  LAYOUT_MODES,
} from "@/routes/chapterV2/utils/header/view-selector/ViewSelector.tsx";
import { LAYOUT_MODE, siteName } from "@/utils/constants.ts";
import UseChapterHook from "./helpers/UseChapterHook.tsx";
import axiosInstance from "@/config/axios-config.ts";
import { useInfiniteQuery } from "react-query";
import { PanelProvider } from "@/context/PanelContext.tsx";
import { getEarlyReturn, mergeSections } from "@/utils/helperFunctions.tsx";
import { useTranslate } from "@tolgee/react";
import Seo from "@/routes/commons/seo/Seo.tsx";

const fetchContentDetails = async ({ pageParam = 0, queryKey }: any) => {
  const [_, textId, limit] = queryKey;
  const offset = pageParam;
  const { data } = await axiosInstance.get(`/api/v1/texts/${textId}/details`, {
    params: { offset, limit },
  });
  return data;
};

const transformLineBreaks = (content: string): string => {
  if (!content) return content;
  return content.replace(/⤵/g, "<br>");
};

const transformSectionsContent = (sections: any[]): any[] => {
  if (!sections) return sections;
  return sections.map((section) => ({
    ...section,
    segments: section.segments?.map((segment: any) => ({
      ...segment,
      content: transformLineBreaks(segment.content),
      translation: segment.translation
        ? {
            ...segment.translation,
            content: transformLineBreaks(segment.translation.content),
          }
        : segment.translation,
    })),
    sections: section.sections
      ? transformSectionsContent(section.sections)
      : section.sections,
  }));
};

const ContentsChapter = ({
  textId,
  contentId,
  segmentId,
  isFromSheet = false,
  versionId,
  addChapter,
  removeChapter,
  currentChapter,
  totalChapters,
  setVersionId,
}: any) => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.SOURCE);
  const [layoutMode, setLayoutMode] = useState(() => {
    const stored = localStorage.getItem(LAYOUT_MODE);
    if (stored === LAYOUT_MODES.PROSE || stored === LAYOUT_MODES.SEGMENTED) {
      return stored;
    }
    return LAYOUT_MODES.SEGMENTED;
  });
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [currentSegmentId, setCurrentSegmentId] = useState(segmentId);
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
    ["content", textId, size],
    fetchContentDetails,
    {
      getNextPageParam: isFromSheet
        ? undefined
        : (lastPage, allPages) => {
            const currentOffset = allPages.length * size;
            if (currentOffset >= lastPage?.total_segments) return undefined;
            return currentOffset;
          },
      enabled: !!textId,
      refetchOnWindowFocus: false,
    },
  );

  // Merge all loaded sections for rendering
  const allContent = useMemo(() => {
    if (!infiniteQuery?.data?.pages || infiniteQuery.data.pages.length === 0)
      return null;
    let mergedSections: any[] = [];
    let text_detail = infiniteQuery.data.pages[0]?.text_detail;

    infiniteQuery.data.pages.forEach((page, index) => {
      mergedSections =
        index === 0
          ? page.content.sections
          : mergeSections(mergedSections, page.content.sections);
    });

    const transformedSections = transformSectionsContent(mergedSections);

    return {
      content: {
        ...infiniteQuery.data.pages[0].content,
        sections: transformedSections,
      },
      text_detail,
    };
  }, [infiniteQuery.data?.pages]);

  const handleSegmentNavigate = useCallback((newSegmentId: any) => {
    setCurrentSegmentId(newSegmentId);
    setScrollTrigger((prev) => prev + 1);
  }, []);

  const handleCurrentSectionChange = useCallback((sectionId: any) => {
    setCurrentSectionId(sectionId);
  }, []);

  // ----------------------------- helpers ---------------------------------------
  const siteBaseUrl = window.location.origin;
  const canonicalUrl = `${siteBaseUrl}${window.location.pathname}`;
  const pageTitle = allContent?.text_detail?.title
    ? `${allContent.text_detail.title} | ${siteName}`
    : `Chapter | ${siteName}`;
  const earlyReturn = getEarlyReturn({
    isLoading: infiniteQuery.isLoading,
    error: infiniteQuery.error,
    t,
  });
  if (earlyReturn) return earlyReturn;
  const canShowTableOfContents =
    (allContent?.content?.sections || []).length > 1;

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
      setLayoutMode,
    };
    return <UseChapterHook {...propsForUseChapterHookComponent} />;
  };

  return (
    <div className="flex flex-col min-h-full">
      <Seo
        title={pageTitle}
        description="Read chapter content with source and translations."
        canonical={canonicalUrl}
      />
      <PanelProvider>{renderChapter()}</PanelProvider>
    </div>
  );
};

export default React.memo(ContentsChapter);
