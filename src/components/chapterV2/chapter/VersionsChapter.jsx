import React, {useState} from "react"
import axiosInstance from "../../../config/axios-config";
import UseChapterHook from "./helpers/UseChapterHook";
import ChapterHeader from "../utils/header/ChapterHeader";
import { VIEW_MODES } from "../utils/header/view-selector/ViewSelector";
import { useQuery } from "react-query";

const fetchVersionsDetails = async (text_id, contentId,direction,size) => {
    const {data} = await axiosInstance.post(`/api/v1/texts/${text_id}/details`, {
      content_id: contentId,
      direction,
      size,
    });
    return data;
  }
const VersionsChapter = ({textId,contentId}) => {
    const [viewMode, setViewMode] = useState(VIEW_MODES.SOURCE)
    const [showTableOfContents, setShowTableOfContents] = useState(false)
    const direction="next"
    const size=20
    const {data: contentsData, isLoading: contentsDataLoading} = useQuery(
      ["content", textId, contentId, direction, size],
      () => fetchVersionsDetails(textId, contentId, direction, size),
      {
        refetchOnWindowFocus: false,
        enabled: true
      }
    )
     const renderChapterHeader = () => {
    const propsForChapterHeader = {viewMode, setViewMode, textdetail:contentsData?.text_detail, showTableOfContents, setShowTableOfContents}
    return <ChapterHeader {...propsForChapterHeader}/>
  }
  const renderChapter = () => {
    const propsForUseChapterHookComponent = {showTableOfContents,content:contentsData?.content, language:contentsData?.text_detail?.language}
    return <UseChapterHook {...propsForUseChapterHookComponent} />
  }
    return (
        <div className="versions-chapter-container">
            {renderChapterHeader()}
            {renderChapter()}
        </div>
    )
}

export  default React.memo(VersionsChapter)