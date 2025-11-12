import React, { useState, useEffect, useRef } from "react";
import { useTranslate } from "@tolgee/react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import PropTypes from "prop-types";
import { getLanguageClass } from "../../../../../utils/helperFunctions.jsx";
import { useQuery } from "react-query";
import { fetchTableOfContents } from "../../../../texts/Texts.jsx";
import "./TableOfContents.scss";

const TableOfContents = (props) => {
  const { textId, showTableOfContents, currentSectionId, onSegmentSelect, language, onClose } = props;
  const { t } = useTranslate();
  const [expandedSections, setExpandedSections] = useState({});
  const tocContainerRef = useRef(null);

  const { data: tableOfContents, error, isLoading } = useQuery(
    ["toc", textId, language],
    () => fetchTableOfContents(textId,0,1000, language),
    {
      enabled: !!textId,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20,
    }
  );
  useEffect(() => {
    const container = tocContainerRef.current;
    if (!container) return;
    const activeElement = container.querySelector('.section-header.current-section');
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentSectionId, expandedSections]);

  // -------------------------------------------- helpers ----------------------------------------------
  const contentData = tableOfContents?.contents || [];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // --------------------------------------------- renderers -------------------------------------------
  const renderToggleIcon = (isExpanded, hasChildren) => {
    if (!hasChildren) return <span className="empty-icon"></span>;
    return isExpanded ? (
      <FiChevronDown size={16} className="toggle-icon" />
    ) : (
      <FiChevronRight size={16} className="toggle-icon" />
    );
  };

  const renderSectionTitle = (section, segmentId) => (
    <button
      type="button"
      onClick={() => onSegmentSelect(segmentId)}
      className={`section-title ${getLanguageClass(tableOfContents?.text_detail?.language)}`}
    >
      {section.title}
    </button>
  );

  const renderNestedSections = (section, contentId) => (
    <div className="nested-content">
      {section.sections.map((childSection) =>
        renderSectionTree(childSection, contentId)
      )}
    </div>
  );

  const renderSectionTree = (section, contentId) => {
    const isExpanded = expandedSections[section.id];
    const hasChildren = section.sections && section.sections.length > 0;
    const segmentId = hasChildren 
      ? section.sections[0]?.segments?.[0]?.segment_id 
      : section.segments?.[0]?.segment_id;
    const isCurrentSection = currentSectionId === section.id;

    return (
      <div key={section.id} className="section-container">
        <button 
          className={`section-header ${isCurrentSection ? 'current-section' : ''}`}
          onClick={(e) => e.target.tagName !== 'A' && toggleSection(section.id)}
        >
          {renderToggleIcon(isExpanded, hasChildren)}
          {renderSectionTitle(section, segmentId)}
        </button>
        {isExpanded && hasChildren && renderNestedSections(section, contentId)}
      </div>
    );
  };

  const renderTocContent = () => {
    if (isLoading) {
      return <div className="toc-loading listtitle">{t("common.loading")}</div>;
    }

    if (error) {
      return <div className="toc-error listtitle">{t("global.not_found")}</div>;
    }

    if (!contentData || contentData.length === 0) {
      return <div className="no-content listtitle">No content found</div>;
    }

    return contentData.flatMap((content) =>
      content?.sections?.map((section) =>
        renderSectionTree(section, content.id)
      ) || []
    );
  };

  return (
    <>
      {showTableOfContents && <button className="toc-backdrop" onClick={onClose}></button>}
      <div className={`table-of-contents ${showTableOfContents ? 'show' : ''}`}>
        <div className="header-thing">
          <p className="listtitle">{t("text.table_of_contents")}</p>
        </div>
        <div className="toc-content" ref={tocContainerRef}>
          <div className="toc-container">
            {renderTocContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(TableOfContents);

TableOfContents.propTypes = {
  textId: PropTypes.string.isRequired,
  showTableOfContents: PropTypes.bool,
  currentSectionId: PropTypes.string,
  onSegmentSelect: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};