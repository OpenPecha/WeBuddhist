import React, {useState, useEffect, useRef} from "react"
import TableOfContents from "../../utils/header/table-of-contents/TableOfContents.jsx";
import "./ChapterHook.scss"
import { getLanguageClass } from "../../../../utils/helperFunctions.jsx";
import { usePanelContext } from "../../../../context/PanelContext.jsx";
import Resources from "../../utils/resources/Resources.jsx";

const UseChapterHook = (props) => {
  const { showTableOfContents, content, language, addChapter, currentChapter, setVersionId} = props
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
    if (!content?.sections?.[0]) return null;
    return (
      renderSectionRecursive(content.sections[0], true)
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