import React, {useState} from 'react'
import {LuPanelLeftClose, LuPanelLeftOpen} from "react-icons/lu";
import {getLanguageClass} from "../../../../utils/Constants.js";
import {BsBookmark, BsBookmarkFill} from "react-icons/bs";
import ViewSelector from "../view-selector/ViewSelector.jsx";
import {MdClose, MdOutlineVerticalSplit} from "react-icons/md";
import "./ChapterHeader.scss"
import TableOfContents from "../table-of-contents/TableOfContents.jsx";


const ChapterHeader = (props) => {

  const {viewMode, setViewMode, showTableOfContents, setShowTableOfContents} = props
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [toggleViewSelector, setToggleViewSelector] = useState(false)
  // ----------------------- renderers --------------------------

  const renderTableOfContents = () => {
    return <div className="toc-container">
      {
        showTableOfContents ?
          <LuPanelLeftClose size={20} onClick={() => setShowTableOfContents(prev => !prev)} style={{ cursor: 'pointer' }}/>
          :
          <div className="toc">
            <LuPanelLeftOpen size={20} onClick={()=> setShowTableOfContents(prev => !prev)} style={{ cursor: 'pointer' }}/>
            <TableOfContents/>
          </div>
      }
    </div>
  }

  const renderChapterTitle = () => {
    return <div className={`title-container ${getLanguageClass(props.language)}`}>
      {props.title}
    </div>
  }

  const renderBookmarkToggler = () => {
    return (
      <div className="bookmark-icon-container">
        <button onClick={() => setIsBookmarked(!isBookmarked)}>
          {isBookmarked ? <BsBookmarkFill size={20}/> : <BsBookmark size={20}/>}
        </button>
      </div>
    )
  }

  const renderViewSelector = () => {
    const propsForViewSelectorComponent = { setToggleViewSelector, viewMode, setViewMode }
    return <div className="view-selector-icon-container">
      <MdOutlineVerticalSplit size={20} onClick={() => setToggleViewSelector(true)}/>
      {toggleViewSelector && <ViewSelector {...propsForViewSelectorComponent}/>}
    </div>
  }

  const renderCloseChapterIcon = () => {
    // render only if we have at least one chapter open
    // so render it conditionally, update the code for that
    return  <div className="close-icon-container">
      <MdClose size={20} />
    </div>
  }

  return (
    <div className="chapter-header-container">
      <div className="left-group">
        {renderTableOfContents()}
      </div>
      {renderChapterTitle()}
      <div className="right-group">
        {renderBookmarkToggler()}
        {renderViewSelector()}
        {renderCloseChapterIcon()}
      </div>
    </div>
  )
}

export default React.memo(ChapterHeader)