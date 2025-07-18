import ChapterHeader from "../utils/header/ChapterHeader.jsx";
import React, {useState} from "react";
import {VIEW_MODES} from "../utils/header/view-selector/ViewSelector.jsx";
import UseChapterHook from "./helpers/UseChapterHook.jsx";
import axiosInstance from "../../../config/axios-config.js";
import {useQuery} from "react-query";
import { PanelProvider } from '../../../context/PanelContext.jsx';

// section id <-> contentId
const fetchContentDetails = async (text_id, contentId,segmentId,direction,size) => {
  const {data} = await axiosInstance.post(`/api/v1/texts/${text_id}/details`, {
    ...(contentId && {content_id: contentId}),
    ...(segmentId && {segment_id: segmentId}),
    direction,
    size,
  });
  return data;
}
const ContentsChapter = ({textId,contentId,segmentId, addChapter, removeChapter, currentChapter, totalChapters}) => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.SOURCE)
  const [showTableOfContents, setShowTableOfContents] = useState(false)
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
  // ------------------------ renderers ----------------------
  const renderChapterHeader = () => {
    const propsForChapterHeader = {viewMode, setViewMode, textdetail:contentsData?.text_detail, showTableOfContents, setShowTableOfContents, removeChapter, currentChapter, totalChapters}
    return <ChapterHeader {...propsForChapterHeader}/>
  }
  const renderChapter = () => {
    const propsForUseChapterHookComponent = {showTableOfContents,content:contentsData?.content, language:contentsData?.text_detail?.language, addChapter, currentChapter}
    return (
      <PanelProvider>
        <UseChapterHook {...propsForUseChapterHookComponent} />
      </PanelProvider>
    );
  }
  return (
    <div className="contents-chapter-container">
      {renderChapterHeader()}
      {renderChapter()}

    </div>
  )
}

export  default React.memo(ContentsChapter)