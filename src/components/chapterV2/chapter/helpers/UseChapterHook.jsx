import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import TableOfContents from "../../utils/header/table-of-contents/TableOfContents.jsx";
import "./ChapterHook.scss"
import { getLanguageClass } from "../../../../utils/helperFunctions.jsx";
import { usePanelContext } from "../../../../context/PanelContext.jsx";
import { useActiveSectionDetection, usePanelNavigation } from "./useTOCHelpers.jsx";
import Resources from "../../utils/resources/Resources.jsx";

const UseChapterHook = (props) => {
  const { showTableOfContents, content, tocData, language, addChapter, currentChapter, setVersionId, infiniteQuery } = props;
  const [selectedSegmentId, setSelectedSegmentId] = useState(null)
  const [activeSectionId, setActiveSectionId] = useState(null); 
  const { isResourcesPanelOpen, openResourcesPanel } = usePanelContext();
  const contentsContainerRef = useRef(null);
  const scrollRef = useRef({ isRestoring: false, previousScrollHeight: 0 });
  const { ref: topSentinelRef, inView: isTopSentinelVisible } = useInView({threshold: 0.1, rootMargin: '50px',});
  const { ref: sentinelRef, inView: isBottomSentinelVisible } = useInView({threshold: 0.1, rootMargin: '50px'});

  useActiveSectionDetection(setActiveSectionId);
  const { navigateToSection } = usePanelNavigation();

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

  useLayoutEffect(() => {
    const scrollContainer = contentsContainerRef.current;
    if (scrollContainer && scrollRef.current.isRestoring) {
      const newScrollHeight = scrollContainer.scrollHeight;
      const heightDifference = newScrollHeight - scrollRef.current.previousScrollHeight;
      scrollContainer.scrollTop += heightDifference;
      scrollRef.current.isRestoring = false;
    }
  }, [content]);

  const handleTOCNavigation = (sectionId) => {
    setActiveSectionId(sectionId);
    navigateToSection(sectionId, {
      updateUrl: true,
      scrollBehavior: "smooth",
      loadMoreContent: infiniteQuery.fetchNextPage,
      hasMoreContent: infiniteQuery.hasNextPage,
      isFetchingNextPage: infiniteQuery.isFetchingNextPage,
      fetchContentBySectionId: props.fetchContentBySectionId,
    });
  };
  // -------------------------- renderers --------------------------
  const renderTableOfContents = () => {
    return showTableOfContents && (
      <TableOfContents
        activeSectionId={activeSectionId}
        onNavigate={handleTOCNavigation}
        tocData={tocData}
        contentsData={{
          ...props.contentsData,
          loadMoreContent: infiniteQuery.fetchNextPage,
          hasMoreContent: infiniteQuery.hasNextPage,
          isFetchingNextPage: infiniteQuery.isFetchingNextPage,
        }}
        show={showTableOfContents}
      />
    );
  };

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

  const renderSectionRecursive = (section) => {
    if (!section) return null;
    return (
      <div className="contents-container" key={section.title || 'root'} data-section-id={section.id}>
        {section.title && (<h2 data-section-id={section.id}>{section.title}</h2> )}
        
        <div className="outer-container">
          {section.segments?.map((segment) => (
            <div key={segment.segment_id} data-segment-id={segment.segment_id}>
            <button className="segment-container" data-segment-id={segment.segment_id} onClick={() => handleSegmentClick(segment.segment_id)}>
              <p className="segment-number">{segment.segment_number}</p>
              <div className="segment-content">
              <p className={`${getLanguageClass(language)}`} dangerouslySetInnerHTML={{ __html: segment.content }} />
              {segment.translation && (
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
      return <Resources segmentId={selectedSegmentId} addChapter={addChapter} currentChapter={currentChapter} setVersionId={setVersionId} />
    }
    return null;
  }

  return (
    <div className="use-chapter-hook-container">
      {renderTableOfContents()}
      <div className="chapter-flex-row">
        <div className="main-content" ref={contentsContainerRef}>
          {renderContents()}
        </div>
        {renderResources()}
      </div>
    </div>
  )
}

export default React.memo(UseChapterHook)