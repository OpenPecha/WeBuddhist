import ChapterHeader from "../utils/header/ChapterHeader.jsx";
import React, { useState, useMemo } from "react";
import { VIEW_MODES } from "../utils/header/view-selector/ViewSelector.jsx";
import UseChapterHook from "./helpers/UseChapterHook.jsx";
import axiosInstance from "../../../config/axios-config.js";
import { useInfiniteQuery } from "react-query";
import { PanelProvider } from '../../../context/PanelContext.jsx';
import { getEarlyReturn, getLastSegmentId, mergeSections } from "../../../utils/helperFunctions.jsx";
import { useTranslate } from "@tolgee/react";
import PropTypes from "prop-types";

const fetchContentDetails = async ({ pageParam = null, queryKey }) => {
  const [_key, textId, contentId, versionId, direction, size, initialSegmentId] = queryKey;
  const segmentId = pageParam ?? initialSegmentId;
  const { data } = await axiosInstance.post(`/api/v1/texts/${textId}/details`, {
    ...(contentId && { content_id: contentId }),
    ...(segmentId && { segment_id: segmentId }),
    ...(versionId && { version_id: versionId }),
    direction,
    size,
  });
  return data;
};

const ContentsChapter = ({ textId, contentId, segmentId, versionId, addChapter, removeChapter, currentChapter, totalChapters, setVersionId }) => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.SOURCE);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const direction = "next";
  const size = 20;
  const { t } = useTranslate();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading:isLoadingContent, error:isErrorContent } = useInfiniteQuery(
    ["content", textId, contentId, versionId, direction, size, segmentId],
    fetchContentDetails,
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.current_segment_position === lastPage?.total_segments ? null : getLastSegmentId(lastPage.content.sections);
      },
      enabled: !!textId,
      refetchOnWindowFocus: false,
    }
  );

  // Merge all loaded sections for rendering
  const allContent = useMemo(() => {
    if (!data?.pages || data.pages.length === 0) return null;
    let mergedSections = [];
    let text_detail = data.pages[0]?.text_detail;

    data.pages.forEach((page, index) => {
      mergedSections = index === 0 ? page.content.sections : mergeSections(mergedSections, page.content.sections);
    });
    return {
      content: { ...data.pages[0].content, sections: mergedSections },text_detail};
  }, [data]);

  // ----------------------------- helpers ---------------------------------------

  const earlyReturn = getEarlyReturn({ isLoading:isLoadingContent, error:isErrorContent, t });
  if (earlyReturn) return earlyReturn;

  // ------------------------ renderers ----------------------
  const renderChapterHeader = () => {
    const propsForChapterHeader = { viewMode, setViewMode, textdetail: allContent?.text_detail, showTableOfContents, setShowTableOfContents, removeChapter, currentChapter, totalChapters };
    return <ChapterHeader {...propsForChapterHeader} />;
  };

  const renderChapter = () => {
    const propsForUseChapterHookComponent = {
      showTableOfContents,
      content: allContent?.content,
      language: allContent?.text_detail?.language,
      addChapter,
      currentChapter,
      setVersionId,
      loadMoreContent: fetchNextPage,
      isLoadingMore: isFetchingNextPage,
      hasMoreContent: hasNextPage,
    };
    return (
      <PanelProvider>
        <UseChapterHook {...propsForUseChapterHookComponent} />
      </PanelProvider>
    );
  };

  return (
    <div className="contents-chapter-container">
      {renderChapterHeader()}
      {renderChapter()}
    </div>
  );
};

export default React.memo(ContentsChapter);
ContentsChapter.propTypes = {
  textId: PropTypes.string.isRequired,
  contentId: PropTypes.string,
  segmentId: PropTypes.string,
  versionId: PropTypes.string,
  addChapter: PropTypes.func,
  removeChapter: PropTypes.func,
  currentChapter: PropTypes.object,
  totalChapters: PropTypes.number,
  setVersionId: PropTypes.func,
};