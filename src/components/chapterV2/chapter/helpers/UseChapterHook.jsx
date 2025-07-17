import React, { useMemo, useState} from "react"
import TableOfContents from "../../utils/header/table-of-contents/TableOfContents.jsx";
import "./ChapterHook.scss"
import { getLanguageClass } from "../../../../utils/helperFunctions.jsx";
/*
  * handles infinite scroll
  * figure out how to update table of contents based on the scroll
*/

const UseChapterHook = (props) => {
  const {showTableOfContents,content,language} = props
  const [selectedSegmentId, setSelectedSegmentId] = useState(null)

  // -------------------------- renderers --------------------------
  const renderTableOfContents = () => {
    return showTableOfContents && <TableOfContents/>
  }

  const renderContents = () => {
    return (
      <div className="contents-container">
        {
          content?.sections[0]?.segments.map((segment)=>(
              <div key={segment.segment_id} className="segment-container">
                <p>{segment.segment_number}</p>
                <div className={`segment-content ${getLanguageClass(language)}`} dangerouslySetInnerHTML={{__html: segment.content}} />
              </div>
          ))
        }
      </div>
    )
  }

  const renderResources = useMemo(() => {
    return (
      <div></div>
    )
  },[selectedSegmentId])

  return (
    <div className="use-chapter-hook-container">
      {renderTableOfContents()}
      {renderContents()}
      {renderResources}
    </div>
  )
}

export default React.memo(UseChapterHook)