import React, {useState} from 'react'
import {LuPanelLeftClose, LuPanelLeftOpen} from "react-icons/lu";
import {BsBookmark, BsBookmarkFill} from "react-icons/bs";
import {MdClose, MdOutlineVerticalSplit} from "react-icons/md";
import "./ChapterHeader.scss"
import ViewSelector from "./view-selector/ViewSelector.jsx";
import {getLanguageClass} from "../../../../utils/helperFunctions.jsx";


const ChapterHeader = (props) => {

  const {viewMode, setViewMode, textdetail, showTableOfContents, setShowTableOfContents, removeChapter, currentChapter, totalChapters} = props
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showViewSelector, setShowViewSelector] = useState(false)
  // ----------------------- renderers --------------------------

  const renderTableOfContentsIcon = () => {
    return <div className="left-group toc-icon-container">
      {
        showTableOfContents ?
          <LuPanelLeftClose size={20} onClick={() => setShowTableOfContents(prev => !prev)} style={{cursor: 'pointer'}}/>
          :
          <LuPanelLeftOpen size={20} onClick={() => setShowTableOfContents(prev => !prev)} style={{cursor: 'pointer'}}/>
      }
    </div>
  }

  const renderChapterTitle = () => {
    return <div className={`title-container ${getLanguageClass(textdetail?.language)}`}>
      {textdetail?.title}
    </div>
  }

  // const renderBookmarkIcon = () => {
  //   return (
  //     <div className="bookmark-icon-container">
  //       <button onClick={() => setIsBookmarked(!isBookmarked)}>
  //         {isBookmarked ? <BsBookmarkFill size={20}/> : <BsBookmark size={20}/>}
  //       </button>
  //     </div>
  //   )
  // }

  const renderViewSelector = () => {
    const propsForViewSelectorComponent = { setShowViewSelector, viewMode, setViewMode }
    return <div className="view-selector-icon-container">
      <MdOutlineVerticalSplit size={20} onClick={() => setShowViewSelector(true)}/>
      {showViewSelector && <ViewSelector {...propsForViewSelectorComponent}/>}
    </div>
  }

  const renderCloseChapterIcon = () => {
    if (totalChapters <= 1) return null;
    return  <div className="close-icon-container">
      <MdClose size={20} onClick={() => removeChapter(currentChapter)} />
    </div>
  }

  return (
    <div className="chapter-header-container">
      {renderTableOfContentsIcon()}
      {renderChapterTitle()}
      {/* {renderBookmarkIcon()} */}
      {renderViewSelector()}
      {renderCloseChapterIcon()}
    </div>
  )
}

export default React.memo(ChapterHeader)