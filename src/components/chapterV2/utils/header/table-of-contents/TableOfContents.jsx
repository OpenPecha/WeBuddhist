import React, { useMemo } from "react";
import { useTranslate } from "@tolgee/react";
import { useSectionHierarchy, useActiveSection, useTOCScrollSync, usePanelNavigation } from "../../../chapter/helpers/useTOCHelpers.jsx";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import PropTypes from "prop-types";
import "./TableOfContents.scss";

const TableOfContents = ({ activeSectionId, onNavigate, tocData, contentsData, show = true }) => {
  const { t } = useTranslate();
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
    { contents: [{ sections: allSections }] }, 
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
        fetchContentBySectionId: contentsData?.fetchContentBySectionId,
      };

      navigateToSection(sectionId, {
        updateUrl: true,
        scrollBehavior: "smooth",
        ...loadingProps,
      });
    }
  };

  const renderSectionRecursive = (section, level = 0) => {
    const isExpanded = sectionHierarchyState[section.id];
    
    const hasExpandableChildren = section.sections && section.sections.length > 0;
    const hasSegments = section.segments && section.segments.length > 0;
    const isActive = activeSectionId === section.id;
    
    return (
      <div key={section.id} className="section-container">
        <button
          type="button"
          className={`section-header ${isActive ? "active-section" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            if (hasExpandableChildren) {
              toggleSection(section.id);
            } else {
              handleSectionClick(section.id, e);
            }
          }}
        >
          {getToggleIcon(hasExpandableChildren, isExpanded)}
          <span className={`section-title ${isActive ? "active" : ""}`} data-section-id={section.id}>
            {section.title}
          </span>
        </button>
  
        {isExpanded && hasExpandableChildren && (
          <div className="nested-content">
            {section.sections.map((childSection) =>
              renderSectionRecursive(childSection, level + 1)
            )}
          </div>
        )}
        
        {isExpanded && hasSegments && (
          <div className="nested-content">
            {section.segments.map((segment) => (
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
                        __html: `${segment.segment_number || ""}. ${(
                          segment.content || "Loading..."
                        ).substring(0, 50)}...`,
                      }}
                    />
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
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
  activeSectionId: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  onNavigate: PropTypes.func,
  show: PropTypes.bool,
  tocData: PropTypes.shape({
    contents: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        sections: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            sections: PropTypes.arrayOf(PropTypes.object),
            segments: PropTypes.arrayOf(
              PropTypes.shape({
                segment_id: PropTypes.string.isRequired,
                segment_number: PropTypes.number.isRequired,
                content: PropTypes.string,
                translation: PropTypes.oneOfType([
                  PropTypes.shape({
                    language: PropTypes.string,
                    content: PropTypes.string
                  }),
                  PropTypes.oneOf([null])
                ])
              })
            )
          })
        )
      })
    )
  }),
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
    fetchContentBySectionId: PropTypes.func
  })
};