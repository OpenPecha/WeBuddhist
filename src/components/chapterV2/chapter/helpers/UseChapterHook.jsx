import React, {useState, useEffect, useRef} from "react"
import TableOfContents from "../../utils/header/table-of-contents/TableOfContents.jsx";
import "./ChapterHook.scss"
import { getLanguageClass } from "../../../../utils/helperFunctions.jsx";
import { usePanelContext } from "../../../../context/PanelContext.jsx";
import Resources from "../../utils/resources/Resources.jsx";

const UseChapterHook = (props) => {
  const { showTableOfContents, content, language, addChapter, currentChapter, setVersionId, loadMoreContent, isLoadingMore, hasMoreContent } = props
  const [selectedSegmentId, setSelectedSegmentId] = useState(null)
  const { isResourcesPanelOpen, openResourcesPanel } = usePanelContext();
  const contentsContainerRef = useRef(null);
  const sentinelRef = useRef(null);
  
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
        
        <div className="outer-container border" ref={isTopLevel ? contentsContainerRef : null}>
          {section.segments?.map((segment) => (
            <div key={segment.segment_id}>
            <button className="segment-container border" onClick={() => handleSegmentClick(segment.segment_id)}>
              <p className="segment-number">{segment.segment_number}</p>
              <div className="segment-content border">
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
      <div className="main-content">
        {renderContents()}
      </div>
      {renderResources()}
      </div>
    </div>
  )
}

export default React.memo(UseChapterHook)