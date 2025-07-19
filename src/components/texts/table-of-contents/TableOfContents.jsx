
import React, {useState} from 'react'
import PaginationComponent from "../../commons/pagination/PaginationComponent.jsx";
import {FiChevronDown, FiChevronRight} from "react-icons/fi";
import {getEarlyReturn, getLanguageClass} from "../../../utils/helperFunctions.jsx";
import {Link} from "react-router-dom";
import "./TableOfContents.scss"
import PropTypes from "prop-types";

const TableOfContents = ({textId, pagination, setPagination, tableOfContents, error, loading, t }) => {
  const [expandedSections, setExpandedSections] = useState({});

  // -------------------------------------------- helpers ----------------------------------------------
  const earlyReturn = getEarlyReturn({loading: loading,error: error, t});
  if (earlyReturn) return earlyReturn;

  const getSectionsData = () => {
    if (tableOfContents?.contents) {
      return {
        sections: tableOfContents.contents.flatMap(content => content.sections || []),
        contentData: tableOfContents.contents,
        isNestedStructure: true
      };
    }
   else if (tableOfContents?.sections) {
      return {
        sections: tableOfContents.sections,
        contentData: [{ id: tableOfContents.id, sections: tableOfContents.sections }],
        isNestedStructure: false
      };
    }
  };

  const { sections = [], contentData = [], isNestedStructure = false } = getSectionsData() || {};
  const totalSections = sections.length;
  const totalPages = Math.ceil(totalSections / pagination.limit);
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, currentPage: pageNumber }));
  };

  // --------------------------------------------- renderers -------------------------------------------

  const renderContentTree = (section, tocId, level = 0, isTopLevel = false) => {
    const isExpanded = expandedSections[section.id];
    const hasChildren = section.sections && section.sections.length > 0;
    const keyPrefix = isTopLevel ? `content-${tocId}-segment` : `section`;
    const renderContentTitle = () => {
      const segmentId=hasChildren?section.sections[0].segments[0].segment_id:section.segments[0].segment_id
      return <Link
        to={`/chapter?text_id=${textId}&content_id=${tocId}&segment_id=${segmentId}`}
        className={`toc-title ${getLanguageClass(tableOfContents.text_detail?.language)}`}>
        {section.title}
      </Link>
    }

    const renderDropIcons = () => {
      return hasChildren ? (
        isExpanded ?
          <FiChevronDown size={16} className="toggle-icon" /> :
          <FiChevronRight size={16} className="toggle-icon" />
      ) : <span className="empty-icon"></span>
    }

    const renderRecursiveSubContents = () => {
      return isExpanded && hasChildren && (
        <div className="nested-content">
          {section.sections.map((childSection) =>
            renderContentTree(childSection, tocId,level + 1, false)
          )}
        </div>
      )
    }
    return (
      <div key={`${keyPrefix}-${section.id}`} className="toc-list-container">
        <button className="toc-header"
             onClick={(e) => e.target.tagName !== 'A' && toggleSection(section.id)}>
          {renderDropIcons()}
          {renderContentTitle()}
        </button>
        {renderRecursiveSubContents()}
      </div>
    );
  };

  const renderContents = () => {
    if (!contentData || contentData.length === 0) {
      return <div className="no-content listtitle">No content found</div>;
    }

    if (isNestedStructure) {
      return contentData.map((content) =>
        content.sections &&
        content.sections.map((segment) =>
          renderContentTree(segment, content.id, 0, true) //for commentary text
        )
      );
    } else {
      return contentData[0]?.sections?.map((section) =>
        renderContentTree(section, contentData[0].id, 0, true) //for root text
      );
    }
  };

  const renderPagination = () => {
    return totalSections > 0 ?
      <PaginationComponent
        pagination={pagination}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        setPagination={setPagination}
      /> : <></>;
  };

  return (
    <div className="toc-container">
      {renderContents()}
      {renderPagination()}
    </div>
  );
};

export default React.memo(TableOfContents);

TableOfContents.propTypes = {
  textId: PropTypes.string.isRequired,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired
  }).isRequired,
  setPagination: PropTypes.func.isRequired,
  tableOfContents : PropTypes.object
}