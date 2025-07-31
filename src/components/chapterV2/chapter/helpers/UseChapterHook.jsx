import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import TableOfContents from "../../utils/header/table-of-contents/TableOfContents.jsx";
import "./ChapterHook.scss"
import { VIEW_MODES } from "../../utils/header/view-selector/ViewSelector.jsx";
import { getLanguageClass, getCurrentSectionFromScroll } from "../../../../utils/helperFunctions.jsx";
import { usePanelContext } from "../../../../context/PanelContext.jsx";
import Resources from "../../utils/resources/Resources.jsx";

const UseChapterHook = (props) => {
  const { showTableOfContents, content, language, viewMode, addChapter, currentChapter, setVersionId,handleSegmentNavigate, infiniteQuery, onCurrentSectionChange, currentSectionId ,textId } = props;
  const [selectedSegmentId, setSelectedSegmentId] = useState(null)
  const { isResourcesPanelOpen, openResourcesPanel } = usePanelContext();
  const contentsContainerRef = useRef(null);
  const scrollRef = useRef({ isRestoring: false, previousScrollHeight: 0 });
  const sectionRefs = useRef(new Map());
  const { ref: topSentinelRef, inView: isTopSentinelVisible } = useInView({threshold: 0.1, rootMargin: '50px',});
  const { ref: sentinelRef, inView: isBottomSentinelVisible } = useInView({threshold: 0.1, rootMargin: '50px'});

  useEffect(() => {
    const container = contentsContainerRef.current;
    const handleScroll = () => {
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const currentSection = getCurrentSectionFromScroll(content.sections, containerRect, sectionRefs);
      currentSection && onCurrentSectionChange(currentSection);
    };
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [content?.sections, onCurrentSectionChange]);

  useEffect(() => {
    if (isBottomSentinelVisible && infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
      infiniteQuery.fetchNextPage();
    }
  }, [isBottomSentinelVisible, infiniteQuery.hasNextPage, infiniteQuery.isFetchingNextPage, infiniteQuery.fetchNextPage]);

  useEffect(() => {
    if (isTopSentinelVisible && infiniteQuery.hasPreviousPage && !infiniteQuery.isFetchingPreviousPage) {
      const scrollContainer = contentsContainerRef.current;
      if (scrollContainer) {
        scrollRef.current.isRestoring = true;
        scrollRef.current.previousScrollHeight = scrollContainer.scrollHeight;
      }
      infiniteQuery.fetchPreviousPage();
    }
  }, [isTopSentinelVisible, infiniteQuery.hasPreviousPage, infiniteQuery.isFetchingPreviousPage, infiniteQuery.fetchPreviousPage]);

  useEffect(() => {
    const container = contentsContainerRef.current;
    if (!container) return;
    const handleDocumentClick = (event) => {
      if (event.target.classList.contains('footnote-marker')) 
        {
        event.stopPropagation();
        event.preventDefault();
        const footnoteMarker = event.target;
        const footnote = footnoteMarker.nextElementSibling;
        if (footnote?.classList?.contains('footnote')) {
          footnote.classList.toggle('active');
        }
        return false;
      }
    };
    container.addEventListener('click', handleDocumentClick);
    return () => {
      container.removeEventListener('click', handleDocumentClick);
    };
  }, []);
  
  useLayoutEffect(() => {
    const scrollContainer = contentsContainerRef.current;
    if (scrollContainer && scrollRef.current.isRestoring) {
      const newScrollHeight = scrollContainer.scrollHeight;
      const heightDifference = newScrollHeight - scrollRef.current.previousScrollHeight;
      scrollContainer.scrollTop += heightDifference;
      scrollRef.current.isRestoring = false;
    }
  }, [content]);

  // -------------------------- renderers --------------------------
  const renderTableOfContents = () => {
    const propsForTableOfContents={textId, showTableOfContents, currentSectionId, onSegmentSelect: handleSegmentNavigate}
    return <TableOfContents {...propsForTableOfContents} />
  }

  const renderLoadingIndicator = (message) => (
    <div className="loading-indicator">
      <p>{message}</p>
    </div>
  );

  const renderScrollSentinelTop = () => (
    <div ref={topSentinelRef} className="scroll-sentinel-top" />
  );

  const renderScrollSentinelBottom = () => (
    <div ref={sentinelRef} className="scroll-sentinel" />
  );

  const handleSegmentClick = (segmentId) => {
    setSelectedSegmentId(segmentId);
    openResourcesPanel();
  };


  const renderSectionRecursive = (section) => {
    if (!section) return null;
    return (
      <div className="contents-container" key={section.title || 'root'}
        ref={(sectionRef) => {sectionRef && section.id && sectionRefs.current.set(section.id, sectionRef)}}>
        {section.title && (<h2>{section.title}</h2> )}
        
        <div className="outer-container">
          {section.segments?.map((segment) => (
            <div key={segment.segment_id}>
            <button className="segment-container" onClick={() => handleSegmentClick(segment.segment_id)}>
              <p className="segment-number">{segment.segment_number}</p>
              <div className="segment-content">
              {(viewMode === VIEW_MODES.SOURCE || viewMode === VIEW_MODES.SOURCE_AND_TRANSLATIONS) && (
                <p className={`${getLanguageClass(language)}`} dangerouslySetInnerHTML={{ __html: segment.content }} />
              )}
              {segment.translation && (viewMode === VIEW_MODES.TRANSLATIONS || viewMode === VIEW_MODES.SOURCE_AND_TRANSLATIONS) && (
                <p className={`${getLanguageClass(segment.translation.language)}`} dangerouslySetInnerHTML={{ __html: segment.translation.content }} />
              )}
              </div> 
            </button>
            </div>
          ))}
          
          {section.sections?.map((nestedSection) => 
            renderSectionRecursive(nestedSection)
          )}
        </div>
      </div>
    );
  };

  const renderContents = () => {
    if (!content?.sections || content.sections.length === 0) return null;
    
    return (
      <div className="outmost-container">
        {infiniteQuery.hasPreviousPage && !infiniteQuery.isFetchingPreviousPage && renderScrollSentinelTop()}
        {infiniteQuery.isFetchingPreviousPage && renderLoadingIndicator("Loading previous content...")}
        {content.sections.map((section) => 
          renderSectionRecursive(section)
        )}
        {infiniteQuery.isFetchingNextPage && renderLoadingIndicator("Loading more content...")}
        {infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage && renderScrollSentinelBottom()}
      </div>
    );
  };

  const renderResources = () => {
    if (isResourcesPanelOpen && selectedSegmentId) {
      return <Resources segmentId={selectedSegmentId} addChapter={addChapter} currentChapter={currentChapter} setVersionId={setVersionId} handleSegmentNavigate={handleSegmentNavigate} />
    }
    return null;
  }

  return (
    <div className="use-chapter-hook-container">
      <div className="chapter-flex-row">
        {renderTableOfContents()}
        <div className="main-content" ref={contentsContainerRef}>
          {renderContents()}
        </div>
        {renderResources()}
      </div>
    </div>
  )
}

export default React.memo(UseChapterHook)