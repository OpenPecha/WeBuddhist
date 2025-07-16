import React, { useMemo, useState} from "react"
import TableOfContents from "../../utils/header/table-of-contents/TableOfContents.jsx";

/*
  * handles infinite scroll
  * figure out how to update table of contents based on the scroll
*/

const UseChapterHook = (props) => {
  const {showTableOfContents} = props
  const [selectedSegmentId, setSelectedSegmentId] = useState(null)

  // -------------------------- renderers --------------------------
  const renderTableOfContents = () => {
    return showTableOfContents && <TableOfContents/>
  }

  const renderContents = () => {

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