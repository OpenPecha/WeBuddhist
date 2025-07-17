import React, {useState } from "react"
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
  const { showTableOfContents, content, language } = props
  const [selectedSegmentId, setSelectedSegmentId] = useState(null)
  const { isResourcesPanelOpen, openResourcesPanel } = usePanelContext();
  // -------------------------- renderers --------------------------
  const renderTableOfContents = () => {
    return showTableOfContents && <TableOfContents />
  }

  const handleSegmentClick = (segmentId) => {
    setSelectedSegmentId(segmentId);
    openResourcesPanel();
  };

  const renderContents = () => {
    return (
      <div className="contents-container">
        {
          content?.sections[0]?.segments.map((segment) => (
            <div
              key={segment.segment_id}
              className="segment-containerf"
              onClick={() => handleSegmentClick(segment.segment_id)}
            >
              <p>{segment.segment_number}</p>
              <p>{segment.segment_id}</p>
              <p className={`segment-content ${getLanguageClass(language)}`} dangerouslySetInnerHTML={{ __html: segment.content }} />
            </div>
          ))
        }
      </div>
    )
  }

  const renderResources = () => {
    if (isResourcesPanelOpen && selectedSegmentId) {
      return <Resources segmentId={selectedSegmentId} />
    }
    return null;
  }

  return (
    <div className="use-chapter-hook-container">
      {renderTableOfContents()}
      {renderContents()}
      {renderResources()}
    </div>
  )
}

export default React.memo(UseChapterHook)