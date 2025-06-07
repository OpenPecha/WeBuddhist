import ChapterHeader from "../utils/header/ChapterHeader.jsx";
import React, {useState} from "react";
import {VIEW_MODES} from "../utils/header/view-selector/ViewSelector.jsx";
import UseChapterHook from "./helpers/UseChapterHook.jsx";
import axiosInstance from "../../../config/axios-config.js";
import {useQuery} from "react-query";

const fetchContentDetails = async (textId, skip, limit, contentId) => {
  const {data} = await axiosInstance.post(`/api/v1/texts/${textId}/details`, {
    ...(contentId && { content_id: contentId }),
    limit,
    skip
  });
  return data;
}
const ContentsChapter = () => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.SOURCE)
  const [showTableOfContents, setShowTableOfContents] = useState(false)
  const {data: contentsData, isLoading: contentsDataLoading} = useQuery(
    ["content", textId, contentId, skip],
    () => fetchContentDetails(textId, skip, 1, contentId),
    {
      refetchOnWindowFocus: false,
      enabled: true
    }
  )
  // ------------------------ renderers ----------------------
  const renderChapterHeader = () => {
    const propsForChapterHeader = {viewMode, setViewMode, showTableOfContents, setShowTableOfContents}
    return <ChapterHeader {...propsForChapterHeader}/>
  }
  const renderChapter = () => {
    const propsForUseChapterHookComponent = {showTableOfContents}
    return <UseChapterHook {...propsForUseChapterHookComponent} />
  }
  return (
    <div className="contents-chapter-container">
      {renderChapterHeader()}
      {renderChapter()}

    </div>
  )
}

export  default React.memo(ContentsChapter)