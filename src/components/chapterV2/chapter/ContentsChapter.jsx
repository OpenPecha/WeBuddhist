import ChapterHeader from "../utils/header/ChapterHeader.jsx";
import React, {useState} from "react";
import {VIEW_MODES} from "../utils/view-selector/ViewSelector.jsx";

const ContentsChapter = () => {

  const [viewMode, setViewMode] = useState(VIEW_MODES.SOURCE)
  const [showTableOfContents, setShowTableOfContents] = useState(false)
  console.log(viewMode,showTableOfContents)
  // ------------------------ renderers ----------------------
  const renderChapterHeader = () => {
    const propsForChapterHeader = {viewMode, setViewMode, showTableOfContents, setShowTableOfContents}
    return <ChapterHeader {...propsForChapterHeader}/>
  }
  return (
    <div className="contents-chapter-container">
      {renderChapterHeader()}
    </div>
  )
}

export  default React.memo(ContentsChapter)