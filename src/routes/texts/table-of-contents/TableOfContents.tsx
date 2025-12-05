import React, {useState, useContext} from 'react'
import PaginationComponent from "../../commons/pagination/PaginationComponent.tsx";
import {FiChevronDown, FiChevronRight} from "react-icons/fi";
import {getEarlyReturn, getLanguageClass} from "../../../utils/helperFunctions.tsx";
import {Link} from "react-router-dom";
import "./TableOfContents.scss"
import PanelContext from "../../../context/PanelContext.tsx";

const TableOfContents = ({textId, pagination, setPagination, tableOfContents, error, loading, t, addChapter, currentChapter, requiredInfo }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const panelContext = useContext(PanelContext);
  const closeResourcesPanel = panelContext?.closeResourcesPanel;

  // -------------------------------------------- helpers ----------------------------------------------
  const earlyReturn = getEarlyReturn({isLoading: loading, error: error, t});
  if (earlyReturn) return earlyReturn;

  const getSectionsData = () => {
    if (tableOfContents?.contents) {
      return {
        sections: tableOfContents.contents.flatMap(content => content.sections || []),
        contentData: tableOfContents.contents
      };
    }
  };

  const { sections = [], contentData = [] } = getSectionsData() || {};
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

  const renderContentTree = (section, tocId) => {
    const isExpanded = expandedSections[section.id];
    const hasChildren = section.sections && section.sections.length > 0;
    const renderContentTitle = () => {
      const segmentId=hasChildren?section.sections[0].segments[0].segment_id:section.segments[0].segment_id
      
      if (addChapter) {
        return (
          <div className="toc-compare-text-item">
            <button
              className={`toc-title-button ${getLanguageClass(tableOfContents.text_detail?.language)}`}
              onClick={() => {
                addChapter({ 
                  textId: textId, 
                  segmentId: segmentId,
                }, currentChapter);
                  closeResourcesPanel?.();
              }}
            >
              {section.title}
            </button>
          </div>
        );
      }
      
      return <Link
        to={`/chapter?text_id=${textId}&content_id=${tocId}&segment_id=${segmentId}`}
        className={`toc-title ${getLanguageClass(tableOfContents.text_detail?.language)}`}>
        {section.title}
      </Link>
    }

    const renderDropIcons = () => {
      const getChevronIcon = () => {
        if (isExpanded) {
          return <FiChevronDown size={16} className="toggle-icon" />;
        }
        return <FiChevronRight size={16} className="toggle-icon" />;
      };
      return hasChildren ? getChevronIcon() : <span className="empty-icon"></span>
    }

    const renderRecursiveSubContents = () => {
      return isExpanded && hasChildren && (
        <div className="nested-content">
          {section.sections.map((childSection) =>
            renderContentTree(childSection, tocId)
          )}
        </div>
      )
    }
    return (
      <div key={`${section.id}`} className="toc-list-container">
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
      return contentData.map((content) =>
        content?.sections?.map((segment) =>
          renderContentTree(segment, content.id)
        )
      );
    
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
    <div className={`${!requiredInfo?.from ? "toc-container" : "minified-toc-container"}`}>
      {renderContents()}
      {renderPagination()}
    </div>
  );
};

export default React.memo(TableOfContents);