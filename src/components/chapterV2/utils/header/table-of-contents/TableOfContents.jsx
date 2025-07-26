import React, { useMemo } from "react";
import { useTranslate } from "@tolgee/react";
import { useQuery } from "react-query";
import { useSectionHierarchy, useActiveSection, useTOCScrollSync, usePanelNavigation } from "../../../chapter/helpers/useTOCHooks.jsx";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import PropTypes from "prop-types";
import axiosInstance from "../../../../../config/axios-config.js";
import { LANGUAGE } from "../../../../../utils/constants.js";
import { mapLanguageCode } from "../../../../../utils/helperFunctions.jsx";
import "./TableOfContents.scss";

const fetchTableOfContents = async (textId) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const { data } = await axiosInstance.get(`/api/v1/texts/${textId}/contents`, {
    params: {
      language,
      limit: 1000,
      skip: 0
    }
  });
  return data;
};

const TableOfContents = ({ textId, activeSectionId, onNavigate, contentsData, show = true }) => {
  const { t } = useTranslate();

  const { data: tocData } = useQuery(
    ["toc", textId],
    () => fetchTableOfContents(textId),
    {
      enabled: !!textId,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20, 
    }
  );

  const { sectionHierarchyState, setSectionHierarchyState, toggleSection } = useSectionHierarchy();
  const { panelRef } = useTOCScrollSync(activeSectionId, show);
  const { navigateToSection } = usePanelNavigation();

  const allSections = useMemo(() => {
    if (tocData?.contents && tocData.contents.length > 0) {
      return tocData.contents.flatMap(content => content.sections || []);
    }
    
    if (contentsData?.pages && contentsData.pages.length > 0) {
      let mergedSections = [];
      contentsData.pages.forEach((page, index) => {
        if (page.content?.sections) {
          mergedSections = index === 0 ? page.content.sections : [...mergedSections, ...page.content.sections];
        }
      });
      return mergedSections;
    }
    
    return [];
  }, [tocData, contentsData]);

  useActiveSection(
    activeSectionId,
    tocData, 
    sectionHierarchyState,
    setSectionHierarchyState
  );

  // ----------------------------- helpers ---------------------------------------
  const getToggleIcon = (hasExpandableChildren, isExpanded) => {
    if (!hasExpandableChildren) return <span className="empty-icon"></span>;
    return isExpanded ? (
      <FiChevronDown className="toggle-icon" />
    ) : (
      <FiChevronRight className="toggle-icon" />
    );
  };

  const handleSectionClick = (sectionId, event) => {
    event.stopPropagation();
    
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      const loadingProps = {
        loadMoreContent: contentsData?.loadMoreContent,
        hasMoreContent: contentsData?.hasMoreContent,
        isFetchingNextPage: contentsData?.isFetchingNextPage,
        fetchContentBySegmentId: contentsData?.fetchContentBySegmentId,
      };

      navigateToSection(sectionId, {
        updateUrl: true,
        scrollBehavior: "smooth",
        ...loadingProps,
      });
    }
  };
  
  const renderExpandButton = (section, isActive, hasExpandableChildren, isExpanded, handleClick) => (
    <button
      type="button"
      className={`section-header ${isActive ? "active-section" : ""}`}
      onClick={handleClick}
    >
      {getToggleIcon(hasExpandableChildren, isExpanded)}
      <span className={`section-title ${isActive ? "active" : ""}`} data-section-id={section.id}>
        {section.title}
      </span>
    </button>
  );

  const renderSegments = (segments) => (
    <div className="nested-content">
      {segments.map((segment) => (
        <div key={segment.segment_id} className="section-container">
          <button
            type="button"
            className={`section-header ${
              activeSectionId === segment.segment_id ? "active-section" : ""
            }`}
            onClick={(e) => handleSectionClick(segment.segment_id, e)}
          >
            <span className="empty-icon"></span>
            <span
              className={`section-title ${
                activeSectionId === segment.segment_id ? "active" : ""
              }`}
              data-segment-id={segment.segment_id}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: `${segment.segment_number || ""}. ${(segment.content || "Loading...").substring(0, 50)}...`,
                }}
              />
            </span>
          </button>
        </div>
      ))}
    </div>
  );

  const renderChildSections = (sections, level) => (
    <div className="nested-content">
      {sections.map((childSection) => renderSectionRecursive(childSection, level + 1))}
    </div>
  );

  const renderSectionRecursive = (section, level = 0) => {
    const isExpanded = sectionHierarchyState[section.id];
    const hasExpandableChildren = section.sections && section.sections.length > 0;
    const hasSegments = section.segments && section.segments.length > 0;
    const isActive = activeSectionId === section.id;

    const handleClick = (e) => {
      e.stopPropagation();
      if (hasExpandableChildren) {
        toggleSection(section.id);
      } else {
        handleSectionClick(section.id, e);
      }
    };

    return (
      <div key={section.id} className="section-container">
        {renderExpandButton(section, isActive, hasExpandableChildren, isExpanded, handleClick)}
        {isExpanded && hasExpandableChildren && renderChildSections(section.sections, level)}
        {isExpanded && hasSegments && renderSegments(section.segments)}
      </div>
    );
  };

  // ----------------------------- renderers -------------------------------------
  const renderTableOfContents = () => {
    return (
      <div className="toc-content">
        <div className="toc-container">
          {allSections.map((section) => renderSectionRecursive(section))}
        </div>
      </div>
    );
  };

if (allSections.length === 0) {
  return (
    <div className={`table-of-contents ${show ? 'show' : ''}`}>
      <div className="headerthing">
        <p className="listtitle">{t("text.table_of_contents")}</p>
      </div>
      <div className="toc-content">
        <div className="toc-container">
          <p>{t("text_category.message.notfound")}</p>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className={`table-of-contents ${show ? 'show' : ''}`} ref={panelRef}>
      <div className="headerthing">
        <p className="listtitle">{t("text.table_of_contents")}</p>
      </div>
      <div className="toc-content">
        {renderTableOfContents()}
      </div>
    </div>
  );
};

export default React.memo(TableOfContents);
TableOfContents.propTypes = {
  textId: PropTypes.string.isRequired,
  activeSectionId: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  onNavigate: PropTypes.func,
  show: PropTypes.bool,
  contentsData: PropTypes.shape({
    pages: PropTypes.arrayOf(
      PropTypes.shape({
        content: PropTypes.shape({
          sections: PropTypes.arrayOf(PropTypes.object)
        })
      })
    ),
    loadMoreContent: PropTypes.func,
    hasMoreContent: PropTypes.bool,
    isFetchingNextPage: PropTypes.bool,
    fetchContentBySegmentId: PropTypes.func
  })
};