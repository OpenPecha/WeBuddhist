import ChapterHeader from "../utils/header/ChapterHeader.jsx";
import React, {useState} from "react";
import {VIEW_MODES} from "../utils/header/view-selector/ViewSelector.jsx";
import UseChapterHook from "./helpers/UseChapterHook.jsx";
import axiosInstance from "../../../config/axios-config.js";
import {useQuery} from "react-query";
import {useSearchParams} from "react-router-dom";

// section id <-> contentId
const fetchContentDetails = async (text_id, contentId,segmentId,direction,size) => {
  const {data} = await axiosInstance.post(`/api/v1/texts/${text_id}/details`, {
    content_id: contentId,
    segment_id: segmentId,
    direction,
    size,
  });
  return data;
}
const ContentsChapter = ({textId,contentId,segmentId}) => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.SOURCE)
  const [showTableOfContents, setShowTableOfContents] = useState(false)
  const [searchParams] = useSearchParams();
  const direction="next"
  const size=20
  const {data: contentsData, isLoading: contentsDataLoading} = useQuery(
    ["content", textId, contentId, segmentId, direction, size],
    () => fetchContentDetails(textId, contentId, segmentId, direction, size),
    {
      refetchOnWindowFocus: false,
      enabled: true
    }
  )
  console.log(contentsData)
  // ------------------------ renderers ----------------------
  const renderChapterHeader = () => {
    const propsForChapterHeader = {viewMode, setViewMode, textdetail:contentsData.text_detail, showTableOfContents, setShowTableOfContents}
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