import React, {useEffect, useRef} from 'react'
import {LuPanelLeftClose, LuPanelLeftOpen} from "react-icons/lu";
import {MdClose} from "react-icons/md";
import { IoChevronBackSharp } from "react-icons/io5";
import "./ChapterHeader.scss"
import ViewSelector from "./view-selector/ViewSelector.tsx";
import {getLanguageClass} from "../../../../utils/helperFunctions.tsx";
import { usePanelContext } from "../../../../context/PanelContext.tsx";
import { useTolgee } from '@tolgee/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import langicon from "@/assets/icons/langicon.svg"

const ChapterHeader = (props) => {

  const {viewMode, setViewMode, layoutMode, setLayoutMode, textdetail, showTableOfContents, setShowTableOfContents, removeChapter, currentChapter, totalChapters, versionSelected, canShowTableOfContents = true} = props
  const { isResourcesPanelOpen, isViewSelectorOpen, setIsViewSelectorOpen, closeResourcesPanel } = usePanelContext()
  const tolgee = useTolgee(['language']);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contentId = searchParams.get('content_id') || searchParams.get('contentId');
  const currentLanguage = tolgee.getLanguage();
  const isTibetan = currentLanguage === 'bo-IN';
  const viewSelectorIconRef = useRef(null);

  const handleBackClick = () => navigate(-1);

  useEffect(() => {
    if (isResourcesPanelOpen) {
      setIsViewSelectorOpen(false);
    }
  }, [isResourcesPanelOpen, setIsViewSelectorOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isViewSelectorOpen && 
          viewSelectorIconRef.current && 
          !viewSelectorIconRef.current.contains(event.target)) {
        setIsViewSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isViewSelectorOpen, setIsViewSelectorOpen]);

  const handleViewSelectorClick = () => {
    closeResourcesPanel();
    setIsViewSelectorOpen((prev) => !prev);
  };
  // ----------------------- renderers --------------------------

  const renderBackIcon = () => {
    return (
      <button className="back-icon-container" onClick={handleBackClick} aria-label="Back">
        <IoChevronBackSharp size={20} />
      </button>
    );
  };

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
    return <div className="view-selector-icon-container" ref={viewSelectorIconRef}>
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
      {renderBackIcon()}
      {renderTableOfContentsIcon()}
      <div className="title-and-view-selector-container">
        <div/>
        {renderChapterTitle()}
        {renderViewSelector()}
      </div>
      {renderCloseChapterIcon()}
    </div>
  )
}

export default React.memo(ChapterHeader)