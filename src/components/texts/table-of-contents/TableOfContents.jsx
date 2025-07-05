
import React, {useMemo, useState} from 'react'
import PaginationComponent from "../../commons/pagination/PaginationComponent.jsx";
import {useTranslate} from "@tolgee/react";
import {FiChevronDown, FiChevronRight} from "react-icons/fi";
import {getLanguageClass} from "../../../utils/helperFunctions.jsx";
import {Link} from "react-router-dom";


const TableOfContents = ({textId, setContentId}) => {
  const [expandedSections, setExpandedSections] = useState({});
  const { t } = useTranslate();
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);


  // -------------------------------------------- helpers ----------------------------------------------

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

  const renderSection = (section, level = 0, contentId, parentIndex, isTopLevel = false) => {
    const isExpanded = expandedSections[section.id];
    const hasChildren = section.sections && section.sections.length > 0;
    const keyPrefix = isTopLevel ? `content-${contentId}-segment` : `section`;

    return (
      <div key={`${keyPrefix}-${section.id}-${parentIndex}`} className="section-container">
        <div
          className="section-header"
          onClick={(e) => {
            // Prevent toggling if clicking the link
            if (e.target.tagName !== 'A') {
              toggleSection(section.id);
            }
          }}
        >
          {hasChildren ? (
            isExpanded ?
              <FiChevronDown size={16} className="toggle-icon" /> :
              <FiChevronRight size={16} className="toggle-icon" />
          ) : <span className="empty-icon"></span>}
          <Link
            to={`/chapter?text_id=${textId}&contentId=${contentId}&versionId=&contentIndex=${parentIndex}${!isTopLevel ? `&sectionId=${section.id}` : ''}`}
            className={`section-title ${getLanguageClass(apiData.text_detail.language)}`}
          >
            {section.title}
          </Link>
        </div>

        {isExpanded && hasChildren && (
          <div className="nested-content">
            {section.sections.map((childSection, childIndex) =>
              renderSection(childSection, level + 1, contentId, isTopLevel ? childIndex : parentIndex, false)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderContents = () => {
    return contents.map((content, contentIndex) => (
      content.sections && content.sections.map((segment, index) =>
        renderSection(segment, 0, content.id, index, true)
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
    <div className="contents-container">
      {renderContents()}
      {renderPagination()}
    </div>
  );
};

export default React.memo(TableOfContents);