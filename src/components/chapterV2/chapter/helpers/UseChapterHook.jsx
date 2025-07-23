import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import TableOfContents from "../../utils/header/table-of-contents/TableOfContents.jsx";
import "./ChapterHook.scss"
import { getLanguageClass } from "../../../../utils/helperFunctions.jsx";
import { usePanelContext } from "../../../../context/PanelContext.jsx";
import Resources from "../../utils/resources/Resources.jsx";

const UseChapterHook = (props) => {
  const { showTableOfContents, content, language, addChapter, currentChapter, setVersionId, loadMoreContent, isLoadingMore, hasMoreContent, loadPreviousContent, isLoadingPrevious, hasPreviousContent } = props
  const [selectedSegmentId, setSelectedSegmentId] = useState(null)
  const { isResourcesPanelOpen, openResourcesPanel } = usePanelContext();
  const contentsContainerRef = useRef(null);
  const sentinelRef = useRef(null);
  const topSentinelRef = useRef(null);
  const scrollRef = useRef({ isRestoring: false, previousScrollHeight: 0 });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !loadMoreContent) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMoreContent && !isLoadingMore) {
          loadMoreContent();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );
    observer.observe(sentinel);
    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [loadMoreContent, hasMoreContent, isLoadingMore]);

  useEffect(() => {
    const topSentinel = topSentinelRef.current;
    if (!topSentinel || !loadPreviousContent) return;
    const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && hasPreviousContent && !isLoadingPrevious) {
            const scrollContainer = contentsContainerRef.current;
            if (scrollContainer) {
              scrollRef.current.isRestoring = true;
              scrollRef.current.previousScrollHeight = scrollContainer.scrollHeight;
            }
            loadPreviousContent();
          }
        },
        { threshold: 0.1, rootMargin: '50px' }
    );
    observer.observe(topSentinel);
    return () => {
      if (topSentinel) {
        observer.unobserve(topSentinel);
      }
    };
  }, [loadPreviousContent, hasPreviousContent, isLoadingPrevious]);

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
    return showTableOfContents && <TableOfContents />
  }

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

  const renderSectionRecursive = (section, isTopLevel = false) => {
    if (!section) return null;
    return (
      <div className="contents-container" key={section.title || 'root'}>
        {section.title && (<h2>{section.title}</h2> )}
        
        <div className="outer-container">
          {section.segments?.map((segment) => (
            <div key={segment.segment_id}>
            <button className="segment-container" onClick={() => handleSegmentClick(segment.segment_id)}>
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
            renderSectionRecursive(nestedSection, false)
          )}
        </div>
      </div>
    );
  };

  const renderContents = () => {
    if (!content?.sections || content.sections.length === 0) return null;
    
    return (
      <div>
        {hasPreviousContent && !isLoadingPrevious && (
            <div ref={topSentinelRef} className="scroll-sentinel-top" />
        )}
        {isLoadingPrevious && (
            <div className="loading-indicator">
              <p>Loading previous content...</p>
            </div>
        )}
        {content.sections.map((section, index) => 
          renderSectionRecursive(section, index === 0)
        )}
        {isLoadingMore && (
          <div className="loading-indicator">
            <p>Loading more content...</p>
          </div>
        )}
        {hasMoreContent && !isLoadingMore && (
          <div ref={sentinelRef} className="scroll-sentinel" />
        )}
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