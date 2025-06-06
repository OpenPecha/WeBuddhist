import ChapterHeader from "../utils/header/ChapterHeader.jsx";
import React, {useState} from "react";
import {VIEW_MODES} from "../utils/header/view-selector/ViewSelector.jsx";

const ContentsChapter = () => {

  const [viewMode, setViewMode] = useState(VIEW_MODES.SOURCE)
  const [showTableOfContents, setShowTableOfContents] = useState(false)
  // ------------------------ renderers ----------------------
  const renderChapterHeader = () => {
    const propsForChapterHeader = {viewMode, setViewMode, showTableOfContents, setShowTableOfContents}
    return <ChapterHeader {...propsForChapterHeader}/>
  }
  const renderChapterContent = () => {

  }
  return (
    <div className="contents-chapter-container">
      {renderChapterHeader()}
      {renderChapterContent()}

    </div>
  )
}

export  default React.memo(ContentsChapter)