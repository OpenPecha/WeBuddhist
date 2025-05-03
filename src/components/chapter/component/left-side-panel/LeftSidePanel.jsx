import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
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
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const {t}=useTranslate();
  const [searchParams] = useSearchParams();
  const textId = searchParams.get("text_id");
  const { data: tocData, isLoading, error } = useQuery(
    ["toc", textId],
    () => fetchTextContent(textId),
    {
      refetchOnWindowFocus: false,
    }
  );
  
  // Update selectedSectionId when activeSectionId changes from scroll spy
  useEffect(() => {
    if (activeSectionId) {
      setSelectedSectionId(activeSectionId);
      
      const expandParentSections = (sections, targetId, parentIds = []) => {
        for (const section of sections || []) {
          if (section.id === targetId) {
            const newExpandedState = {...expandedSections};
            parentIds.forEach(id => {
              newExpandedState[id] = true;
            });
            setExpandedSections(newExpandedState);
            return true;
          }
          
          if (section.sections && section.sections.length > 0) {
            const found = expandParentSections(
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
            expandParentSections(content.sections, activeSectionId);
          }
        });
      }
    }
  }, [activeSectionId, tocData]);
  
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
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
    const isExpanded = expandedSections[section.id];
    const hasChildren = section.sections && section.sections.length > 0;
    const isSelected = section.id === selectedSectionId;
    const isActive = section.id === activeSectionId;

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
          <span 
            className={`section-title ${getLanguageClass(tocData.text_detail.language)} ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleSectionClick(section.id, parentIndex);
            }}
          >
            {section.title}
          </span>
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
          <IoMdClose
            size={24}
            onClick={closeLeftPanel}
            className="close-icon"
          />
        </div>
        <div className="panel-content p-3">
          {isLoading && <p>{t("common.loading")}</p>}
          {error && <p>{t("message.there_is_error")}: {error.message}</p>}
          {!isLoading && !error && tocData && tocData.contents && tocData.contents.length === 0 && (
            <p>{t("text_category.message.notfound")}</p>
          )}
          {!isLoading && !error && tocData && tocData.contents && tocData.contents.length > 0 && (
            <div className="toc-container">
              {tocData.contents.map((content, contentIndex) => (
                content.sections && content.sections.map((segment, index) => {
                  const hasChildren = segment.sections && segment.sections.length > 0;
                  const isSelected = segment.id === selectedSectionId;
                  const isActive = segment.id === activeSectionId;

                  return (
                    <div key={`content-${contentIndex}-segment-${segment.id}-${index}`} className="section-container">
                      <div 
                        className="section-header"
                        onClick={() => toggleSection(segment.id)}
                      >
                        {hasChildren ? (
                          expandedSections[segment.id] ? 
                            <FiChevronDown size={16} className="toggle-icon" /> : 
                            <FiChevronRight size={16} className="toggle-icon" />
                        ) : <span className="empty-icon"></span>}
                        <button 
                          className={`section-title ${getLanguageClass(tocData.text_detail.language)} ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation(); 
                            handleSectionClick(segment.id, index);
                          }}
                        >
                          {segment.title}
                        </button>
                      </div>

                      {expandedSections[segment.id] && hasChildren && (
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
