import React, {useState, useEffect, useRef} from "react"
import TableOfContents from "../../utils/header/table-of-contents/TableOfContents.jsx";
import "./ChapterHook.scss"
import { getLanguageClass } from "../../../../utils/helperFunctions.jsx";
import { usePanelContext } from "../../../../context/PanelContext.jsx";
import Resources from "../../utils/resources/Resources.jsx";
/*
  * handles infinite scroll
  * figure out how to update table of contents based on the scroll
*/

const UseChapterHook = (props) => {
  const { showTableOfContents, content, language, addChapter, currentChapter } = props
  const [selectedSegmentId, setSelectedSegmentId] = useState(null)
  const { isResourcesPanelOpen, openResourcesPanel } = usePanelContext();
  const contentsContainerRef = useRef(null);
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
        if (footnote && footnote.classList.contains('footnote')) {
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
        
        <div className="outer-container" ref={isTopLevel ? contentsContainerRef : null}>
          {section.segments?.map((segment) => (
            <button
              key={segment.segment_id}
              className="segment-container"
              onClick={() => handleSegmentClick(segment.segment_id)}
            >
              <p className="segment-number">{segment.segment_number}</p>
              <p 
                className={`${getLanguageClass(language)}`} 
                dangerouslySetInnerHTML={{ __html: segment.content }} 
              />
            </button>
          ))}
          
          {section.sections?.map((nestedSection) => 
            renderSectionRecursive(nestedSection, false)
          )}
        </div>
      </div>
    );
  };

  const renderContents = () => {
    if (!content?.sections?.[0]) return null;
    return (
      <>
        {renderSectionRecursive(content.sections[0], true)}
      </>
    );
  };

  const renderResources = () => {
    if (isResourcesPanelOpen && selectedSegmentId) {
      return <Resources segmentId={selectedSegmentId} addChapter={addChapter} currentChapter={currentChapter} />
    }
    return null;
  }

  return (
    <div className="use-chapter-hook-container">
      {renderTableOfContents()}
      <div className="main-content">
        {renderContents()}
      </div>
      {renderResources()}
    </div>
  )
}

export default React.memo(UseChapterHook)