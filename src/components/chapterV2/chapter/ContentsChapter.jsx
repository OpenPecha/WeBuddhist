import ChapterHeader from "../utils/header/ChapterHeader.jsx";
import React, {useState} from "react";
import {VIEW_MODES} from "../utils/header/view-selector/ViewSelector.jsx";
import UseChapterHook from "./helpers/UseChapterHook.jsx";
import axiosInstance from "../../../config/axios-config.js";
import {useQuery} from "react-query";
import { PanelProvider } from '../../../context/PanelContext.jsx';
import { getEarlyReturn } from "../../../utils/helperFunctions.jsx";
import { useTranslate } from "@tolgee/react";
import PropTypes from "prop-types";

const fetchContentDetails = async (text_id, contentId, segmentId, versionId, direction, size) => {
  const {data} = await axiosInstance.post(`/api/v1/texts/${text_id}/details`, {
    ...(contentId && {content_id: contentId}),
    ...(segmentId && {segment_id: segmentId}),
    ...(versionId && {version_id: versionId}),
    direction,
    size,
  });
  return data;
}
const ContentsChapter = ({textId, contentId, segmentId, versionId, addChapter, removeChapter, currentChapter, totalChapters, setVersionId}) => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.SOURCE)
  const [showTableOfContents, setShowTableOfContents] = useState(false)
  const direction="next"
  const size=20
  const {t} = useTranslate();
  const {data: contentsData, isLoading: contentsDataLoading, error} = useQuery(
    ["content", textId, contentId, segmentId, versionId, direction, size],
    () => fetchContentDetails(textId, contentId, segmentId, versionId, direction, size),
    {
      refetchOnWindowFocus: false,
      enabled: !!textId
    }
  )

  // ----------------------------------- helpers -----------------------------------------
  const earlyReturn = getEarlyReturn({ isLoading: contentsDataLoading, error: error, t });
  if (earlyReturn) return earlyReturn;
  
  // ------------------------ renderers ----------------------
  const renderChapterHeader = () => {
    const propsForChapterHeader = {viewMode, setViewMode, textdetail:contentsData?.text_detail, showTableOfContents, setShowTableOfContents, removeChapter, currentChapter, totalChapters}
    return <ChapterHeader {...propsForChapterHeader}/>
  }
  const renderChapter = () => {
    const propsForUseChapterHookComponent = {showTableOfContents,content:contentsData?.content, language:contentsData?.text_detail?.language, addChapter, currentChapter, setVersionId}
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
}