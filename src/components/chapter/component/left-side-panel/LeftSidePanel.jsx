import React, { useState, useEffect, useRef } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { usePanelContext } from "../../../../context/PanelContext.jsx";
import { useQuery } from "react-query";
import axiosInstance from "../../../../config/axios-config.js";
import { LANGUAGE } from "../../../../utils/constants.js";
import "./LeftSidePanel.scss";
import { useTranslate } from "@tolgee/react";
import { useSearchParams } from "react-router-dom";
import {getLanguageClass, mapLanguageCode} from "../../../../utils/helperFunctions.jsx";

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
  const {t}=useTranslate();
  const [searchParams, setSearchParams] = useSearchParams();
  const textId = currentChapter.textId || searchParams.get("text_id");
  const panelContentRef = useRef(null);
  const activeElementRef = useRef(null);
  const { data: tocData, isLoading} = useQuery(
    ["toc", textId],
    () => fetchTextContent(textId),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20,
    }
  );
  

  const toggleSection = (sectionId) => {
    setSectionHierarchyState(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  const handleSectionClick = (sectionId, contentIndex) => {
    if (updateChapter && currentChapter) {
      const validContentIndex = contentIndex !== undefined && !isNaN(parseInt(contentIndex, 10)) 
        ? parseInt(contentIndex, 10) 
        : 0;
      if (currentChapter.contentIndex !== validContentIndex) {
        updateChapter(currentChapter, { 
          contentIndex: validContentIndex,
          sectionId: sectionId 
        });
        
        const newParams = new URLSearchParams(searchParams);
        newParams.set('contentIndex', validContentIndex.toString());
        setSearchParams(newParams);
      }
      else
      {
        updateChapter(currentChapter,{
          sectionId: sectionId
        })
      }
    }
  };
  
  // Scroll active section into view when it changes
  useEffect(() => {
    if (!activeSectionId || !showPanel) return;
   const activeElement = document.querySelector(`.section-title.active[data-section-id="${activeSectionId}"]`);
    if (activeElement && panelContentRef.current) {
      activeElementRef.current = activeElement;
      
      const panelRect = panelContentRef.current.getBoundingClientRect();
      const elementRect = activeElement.getBoundingClientRect();
      
      const isAbove = elementRect.top < panelRect.top;
      const isBelow = elementRect.bottom > panelRect.bottom;
        
      if (isAbove || isBelow) {
        const scrollOptions = { behavior: 'smooth', block: 'center' };
        activeElement.scrollIntoView(scrollOptions);
      }
    }
  }, [activeSectionId, showPanel]);
  
  // Track active sections and expand their parents
  useEffect(() => {
    if (!activeSectionId || !tocData || !tocData.contents) return;
    
    // Function to find and expand parent sections
    const expandParentSections = (sections, targetId, parentPath = []) => {
      for (const section of sections || []) {
        // Check if this section is the target
        if (section.id === targetId) {
          // Check if we need to update state
          let needsUpdate = false;
          const newState = {...sectionHierarchyState};
          
          parentPath.forEach(parentId => {
            if (!sectionHierarchyState[parentId]) {
              newState[parentId] = true;
              needsUpdate = true;
            }
          });
          
          // Only update state if necessary
          if (needsUpdate) {
            setSectionHierarchyState(newState);
          }
          return true;
        }
        
        // Check nested sections
        if (section.sections && section.sections.length > 0) {
          const found = expandParentSections(
            section.sections, 
            targetId, 
            [...parentPath, section.id]
          );
          if (found) return true;
        }
      }
      return false;
    };
    
    // Start search from top-level sections
    let processed = false;
    tocData.contents.forEach(content => {
      if (!processed && content.sections) {
        processed = expandParentSections(content.sections, activeSectionId);
      }
    });
  }, [activeSectionId, tocData]);
  
  const renderSection = (section, level = 0, contentId, parentIndex) => {
    const isExpanded = sectionHierarchyState[section.id];
    const hasChildren = section.sections && section.sections.length > 0;
    const isActive = activeSectionId === section.id;
    
    const validParentIndex = parentIndex !== undefined && !isNaN(parseInt(parentIndex, 10)) 
      ? parseInt(parentIndex, 10) 
      : 0;
    
    return (
      <div 
        key={`section-${section.id}`} 
        className="section-container"
      >
        <div
          className={`section-header ${isActive ? 'active-section' : ''}`}
          onClick={() => toggleSection(section.id)}
        >
          {hasChildren ? (
            isExpanded ?
              <FiChevronDown size={16} className="toggle-icon" /> :
              <FiChevronRight size={16} className="toggle-icon" />
          ) : <span className="empty-icon"></span>}
          <button 
            className={`section-title ${getLanguageClass(tocData?.text_detail?.language || 'en')} ${isActive ? 'active' : ''}`}
            data-section-id={section.id}
            onClick={(e) => {
              e.stopPropagation();
              handleSectionClick(section.id, validParentIndex);
            }}
          >
            {section.title}
          </button>
        </div>

          {isExpanded && hasChildren && (
            <div 
              className="nested-content"
            >
              {section.sections.map((childSection) =>
                renderSection(childSection, level + 1, contentId, validParentIndex)
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
                

                  return (
                    <div 
                      key={`content-${contentIndex}-segment-${segment.id}-${index}`} 
                      className="section-container"
                    >
                      <div 
                        className={`section-header ${activeSectionId === segment.id ? 'active-section' : ''}`}
                        onClick={() => toggleSection(segment.id)}
                      >
                        {hasChildren ? (
                          sectionHierarchyState[segment.id] ? 
                            <FiChevronDown size={16} className="toggle-icon" /> : 
                            <FiChevronRight size={16} className="toggle-icon" />
                        ) : <span className="empty-icon"></span>}
                        <button 
                        className={`section-title ${getLanguageClass(tocData.text_detail.language)} ${activeSectionId === segment.id ? 'active' : ''}`}
                        data-section-id={segment.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          const validIndex = index !== undefined && !isNaN(parseInt(index, 10)) 
                            ? parseInt(index, 10) 
                            : 0;
                          handleSectionClick("", validIndex);
                        }}
                      >
                        {segment.title}
                      </button>
                      </div>

                      {sectionHierarchyState[segment.id] && hasChildren && (
                        <div 
                          className="nested-content"
                          >
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
