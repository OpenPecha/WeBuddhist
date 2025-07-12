
import React, {useState} from 'react'
import PaginationComponent from "../../commons/pagination/PaginationComponent.jsx";
import {FiChevronDown, FiChevronRight} from "react-icons/fi";
import {getLanguageClass} from "../../../utils/helperFunctions.jsx";
import {Link} from "react-router-dom";
import "./TableOfContents.scss"
import PropTypes from "prop-types";

const TableOfContents = ({textId, pagination, setPagination, tableOfContents }) => {
  const [expandedSections, setExpandedSections] = useState({});

  // -------------------------------------------- helpers ----------------------------------------------

  const contents = tableOfContents?.contents;
  const totalSections = contents.reduce((total, content) => {
    return total + (content?.sections?.length || 0);
  }, 0);
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

  const renderContentTree = (section, tocId, parentIndex, level = 0, isTopLevel = false) => {
    const isExpanded = expandedSections[section.id];
    const hasChildren = section.sections && section.sections.length > 0;
    const keyPrefix = isTopLevel ? `content-${tocId}-segment` : `section`;

    const renderContentTitle = () => {
      return <Link
        to={`/chapter?text_id=${textId}&contentId=${tocId}&versionId=&contentIndex=${parentIndex}${!isTopLevel ? `&sectionId=${section.id}` : ''}`}
        className={`toc-title ${getLanguageClass(tableOfContents.text_detail.language)}`}>
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
          {section.sections.map((childSection, childIndex) =>
            renderContentTree(childSection, tocId, isTopLevel ? childIndex : parentIndex,level + 1, false)
          )}
        </div>
      )
    }
    return (
      <div key={`${keyPrefix}-${section.id}-${parentIndex}`} className="toc-list-container">
        <div className="toc-header"
          // Prevent toggling if clicking the link
             onClick={(e) => e.target.tagName !== 'A' && toggleSection(section.id)}>
          {renderDropIcons()}
          {renderContentTitle()}
        </div>
        {renderRecursiveSubContents()}
      </div>
    );
  };

  const renderContents = () => {
    return contents.map((content, contentIndex) => (
      content.sections && content.sections.map((segment, index) =>
        renderContentTree(segment, content.id, index, 0,true)
      )
    ));
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