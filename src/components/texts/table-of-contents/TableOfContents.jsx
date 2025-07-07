
import React, {useState} from 'react'
import PaginationComponent from "../../commons/pagination/PaginationComponent.jsx";
import {useTranslate} from "@tolgee/react";
import {FiChevronDown, FiChevronRight} from "react-icons/fi";
import {getLanguageClass} from "../../../utils/helperFunctions.jsx";
import {Link} from "react-router-dom";


const TableOfContents = ({textId, pagination, setPagination, tableOfContents }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const { t } = useTranslate();


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

  const renderContentTree = (section, level = 0, contentId, parentIndex, isTopLevel = false) => {
    const isExpanded = expandedSections[section.id];
    const hasChildren = section.sections && section.sections.length > 0;
    const keyPrefix = isTopLevel ? `content-${contentId}-segment` : `section`;

    const renderContentTitle = () => {
      return <Link
        to={`/chapter?text_id=${textId}&contentId=${contentId}&versionId=&contentIndex=${parentIndex}${!isTopLevel ? `&sectionId=${section.id}` : ''}`}
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
            renderContentTree(childSection, level + 1, contentId, isTopLevel ? childIndex : parentIndex, false)
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
        renderContentTree(segment, 0, content.id, index, true)
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