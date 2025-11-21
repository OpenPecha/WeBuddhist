import React, {useEffect} from 'react'
import {LuPanelLeftClose, LuPanelLeftOpen} from "react-icons/lu";
import {MdClose, MdOutlineVerticalSplit} from "react-icons/md";
import { TbLetterA } from "react-icons/tb";
import "./ChapterHeader.scss"
import ViewSelector from "./view-selector/ViewSelector.jsx";
import {getLanguageClass} from "../../../../utils/helperFunctions.jsx";
import PropTypes from "prop-types";
import { usePanelContext } from "../../../../context/PanelContext.jsx";
import { useTolgee } from '@tolgee/react';
import langicon from "../../../../assets/langicon.svg"

const ChapterHeader = (props) => {

  const {viewMode, setViewMode, layoutMode, setLayoutMode, textdetail, showTableOfContents, setShowTableOfContents, removeChapter, currentChapter, totalChapters, versionSelected, canShowTableOfContents = true} = props
  const { isResourcesPanelOpen, isViewSelectorOpen, setIsViewSelectorOpen, closeResourcesPanel } = usePanelContext()
  const tolgee = useTolgee(['language']);
  const currentLanguage = tolgee.getLanguage();
  const isTibetan = currentLanguage === 'bo-IN';
  useEffect(() => {
    if (isResourcesPanelOpen) {
      setIsViewSelectorOpen(false);
    }
  }, [isResourcesPanelOpen, setIsViewSelectorOpen]);

  const handleViewSelectorClick = () => {
    closeResourcesPanel();
    setIsViewSelectorOpen((prev) => !prev);
  };
  // ----------------------- renderers --------------------------

  const renderTableOfContentsIcon = () => {
    if (!canShowTableOfContents) return null;
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
    return <div className={`title-container ${isTibetan && 'mt-2'} ${getLanguageClass(textdetail?.language)}`}>
      {textdetail?.title}
    </div>
  }

  const renderViewSelector = () => {
    const propsForViewSelectorComponent = { setShowViewSelector: () => setIsViewSelectorOpen(false), viewMode, setViewMode, layoutMode, setLayoutMode, versionSelected }
    return <div className="view-selector-icon-container">
      <img src={langicon} alt="view selector" onClick={handleViewSelectorClick}/>
      {isViewSelectorOpen && <ViewSelector {...propsForViewSelectorComponent}/>}
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
      <div className="title-and-view-selector-container">
        {renderChapterTitle()}
        {renderViewSelector()}
      </div>
      {renderCloseChapterIcon()}
    </div>
  )
}

export default React.memo(ChapterHeader)

ChapterHeader.propTypes = {
  viewMode: PropTypes.string.isRequired,
  setViewMode: PropTypes.func.isRequired,
  layoutMode: PropTypes.string.isRequired,
  setLayoutMode: PropTypes.func.isRequired,
  textdetail: PropTypes.shape({
    language: PropTypes.string,
    title: PropTypes.string,
  }),
  showTableOfContents: PropTypes.bool.isRequired,
  setShowTableOfContents: PropTypes.func.isRequired,
  removeChapter: PropTypes.func.isRequired,
  currentChapter: PropTypes.object.isRequired,
  totalChapters: PropTypes.number.isRequired,
  versionSelected: PropTypes.bool,
  canShowTableOfContents: PropTypes.bool,
};