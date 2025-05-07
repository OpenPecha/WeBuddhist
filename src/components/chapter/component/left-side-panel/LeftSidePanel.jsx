import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { usePanelContext } from "../../../../context/PanelContext.jsx";
import { useQuery } from "react-query";
import axiosInstance from "../../../../config/axios-config.js";
import { LANGUAGE, mapLanguageCode, getLanguageClass } from "../../../../utils/Constants.js";
import "./LeftSidePanel.scss";
import { useTranslate } from "@tolgee/react";
import { useSearchParams } from "react-router-dom";

const fetchTextContent = async (textId) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const { data } = await axiosInstance.get(`/api/v1/texts/${textId}/contents`, {
    params: {
      language,
      limit: 10, 
      skip: 0
    }
  });
  return data;
};

const LeftSidePanel = ({ updateChapter, currentChapter, activeSectionId }) => {
  const { isLeftPanelOpen, closeLeftPanel } = usePanelContext();
  const showPanel = isLeftPanelOpen;
  const [sectionHierarchyState, setSectionHierarchyState] = useState({});
  const [activeSectionPath, setActiveSectionPath] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const {t}=useTranslate();
  const [searchParams] = useSearchParams();
  const textId = currentChapter.textId || searchParams.get("text_id");
  const { data: tocData, isLoading} = useQuery(
    ["toc", textId],
    () => fetchTextContent(textId),
    {
      refetchOnWindowFocus: false,
    }
  );
  
  const panelContentRef = useRef(null);
  const shouldScrollRef = useRef(false);

 
  const findActiveElement = useCallback(() => {
    if (!panelContentRef.current || !activeSectionId) return null;
    
    const elementByDataAttr = panelContentRef.current.querySelector(`button[data-section-id="${activeSectionId}"]`);
    if (elementByDataAttr) return elementByDataAttr;
    
    const activeElements = panelContentRef.current.querySelectorAll('.section-title.active');
    return activeElements.length > 0 ? activeElements[0] : null;
  }, [activeSectionId]);

  const scrollActiveElementIntoView = useCallback(() => {
    if (!panelContentRef.current || !shouldScrollRef.current) return;
    
    const activeElement = findActiveElement();
    if (!activeElement) return;
    
    const container = panelContentRef.current;
    const containerRect = container.getBoundingClientRect();
    const elementRect = activeElement.getBoundingClientRect();
    
    const isVisible = (
      elementRect.top >= containerRect.top && 
      elementRect.bottom <= containerRect.bottom
    );
    
    if (!isVisible) {
      const scrollTop = activeElement.offsetTop - (container.clientHeight / 2) + (activeElement.offsetHeight / 2);
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
    
    shouldScrollRef.current = false;
  }, [findActiveElement]);

  // Update selectedSectionId when activeSectionId changes from scroll spy
  useEffect(() => {
    if (activeSectionId) {
      setSelectedSectionId(activeSectionId);
      shouldScrollRef.current = true;
      
      const maintainSectionHierarchy = (sections, targetId, parentIds = []) => {
        for (const section of sections || []) {
          if (section.id === targetId) {
            const newExpandedState = {};
            parentIds.forEach(id => {
              newExpandedState[id] = true;
            });
            setSectionHierarchyState(newExpandedState);
            setActiveSectionPath([...parentIds, targetId]);
            return true;
          }
          
          if (section.sections && section.sections.length > 0) {
            const found = maintainSectionHierarchy(
              section.sections, 
              targetId, 
              [...parentIds, section.id]
            );
            if (found) return true;
          }
        }
        return false;
      };
      
      if (tocData && tocData.contents) {
        tocData.contents.forEach(content => {
          if (content.sections) {
            maintainSectionHierarchy(content.sections, activeSectionId);
          }
        });
      }
    }
  }, [activeSectionId, tocData]);
  
  // Handle scrolling after the DOM has updated
  useEffect(() => {
    if (shouldScrollRef.current) {
      requestAnimationFrame(() => {
        scrollActiveElementIntoView();
      });
    }
  }, [scrollActiveElementIntoView, activeSectionPath]);
  
  const toggleSection = (sectionId) => {
    setSectionHierarchyState(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  const handleSectionClick = (sectionId, contentIndex) => {
    setSelectedSectionId(sectionId);
    if (updateChapter && currentChapter) {
      updateChapter(currentChapter, { 
        contentIndex: contentIndex,
        sectionId: sectionId 
      });
    }
  };
  
  const renderSection = (section, level = 0, contentId, parentIndex) => {
    const isExpanded = sectionHierarchyState[section.id];
    const hasChildren = section.sections && section.sections.length > 0;
    const isSelected = section.id === selectedSectionId;
    const isActive = section.id === activeSectionId || activeSectionPath.includes(section.id);

    return (
      <div key={`section-${section.id}`} className="section-container">
        <div
          className="section-header"
          onClick={() => toggleSection(section.id)}
        >
          {hasChildren ? (
            isExpanded ?
              <FiChevronDown size={16} className="toggle-icon" /> :
              <FiChevronRight size={16} className="toggle-icon" />
          ) : <span className="empty-icon"></span>}
          <button 
            className={`section-title ${getLanguageClass(tocData.text_detail.language)} ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}`}
            data-section-id={section.id}
            onClick={(e) => {
              e.stopPropagation();
              handleSectionClick(section.id, parentIndex);
            }}
            ref={isActive ? (el) => {
              if (el && shouldScrollRef.current) {
                requestAnimationFrame(() => scrollActiveElementIntoView());
              }
            } : null}
          >
            {section.title} 
          </button>
        </div>

        {isExpanded && hasChildren && (
          <div className="nested-content">
            {section.sections.map((childSection) =>
              renderSection(childSection, level + 1, contentId, parentIndex)
            )}
          </div>
        )}
      </div>
    );
  };
  
  const renderMainPanel = () => {
    return (
      <>
        <div className="headerthing">
          <p className='mt-4 px-4 listtitle'>{t("text.table_of_contents")}</p>
        </div>
        <div className="panel-content p-3" ref={panelContentRef}>
          {isLoading && <p>{t("common.loading")}</p>}
          {!isLoading && tocData && tocData.contents && tocData.contents.length === 0 && (
            <p>{t("text_category.message.notfound")}</p>
          )}
          {!isLoading && tocData && tocData.contents && tocData.contents.length > 0 && (
            <div className="toc-container">
              {tocData.contents.map((content, contentIndex) => (
                content.sections && content.sections.map((segment, index) => {
                  const hasChildren = segment.sections && segment.sections.length > 0;
                  const isSelected = segment.id === selectedSectionId;
                  const isActive = segment.id === activeSectionId || activeSectionPath.includes(segment.id);

                  return (
                    <div key={`content-${contentIndex}-segment-${segment.id}-${index}`} className="section-container">
                      <div 
                        className="section-header"
                        onClick={() => toggleSection(segment.id)}
                      >
                        {hasChildren ? (
                          sectionHierarchyState[segment.id] ? 
                            <FiChevronDown size={16} className="toggle-icon" /> : 
                            <FiChevronRight size={16} className="toggle-icon" />
                        ) : <span className="empty-icon"></span>}
                        <button 
                          className={`section-title ${getLanguageClass(tocData.text_detail.language)} ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}`}
                          data-section-id={segment.id}
                          onClick={(e) => {
                            e.stopPropagation(); 
                            handleSectionClick(segment.id, index);
                          }}
                          ref={isActive ? (el) => {
                            // This ensures we can get a reference to the active element
                            if (el && shouldScrollRef.current) {
                              requestAnimationFrame(() => scrollActiveElementIntoView());
                            }
                          } : null}
                        >
                          {segment.title}
                        </button>
                      </div>

                      {sectionHierarchyState[segment.id] && hasChildren && (
                        <div className="nested-content">
                          {segment.sections.map((section) => 
                            renderSection(section, 1, content.id, index)
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      {showPanel && <div className="panel-backdrop" onClick={() => closeLeftPanel()}></div>}
      <div className={`left-panel navbaritems ${showPanel ? 'show' : ''}`}>
        {renderMainPanel()}
      </div>
    </>
  );
};

export default LeftSidePanel;
