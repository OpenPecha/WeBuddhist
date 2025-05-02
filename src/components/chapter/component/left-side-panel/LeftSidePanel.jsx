import React, { useState } from "react";
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

const LeftSidePanel = ({ updateChapter, currentChapter }) => {
  const { isLeftPanelOpen, closeLeftPanel } = usePanelContext();
  const showPanel = isLeftPanelOpen;
  const [expandedSections, setExpandedSections] = useState({});
  const {t}=useTranslate();
  const [searchParams] = useSearchParams();
  const textId = searchParams.get("text_id");
  const { data: tocData, isLoading} = useQuery(
    ["toc", textId],
    () => fetchTextContent(textId),
    {
      refetchOnWindowFocus: false,
    }
  );
  
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  const renderSection = (section, level = 0, contentId, parentIndex) => {
    const isExpanded = expandedSections[section.id];
    const hasChildren = section.sections && section.sections.length > 0;

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
            className={`section-title ${getLanguageClass(tocData.text_detail.language)}`}
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
          {!isLoading && tocData && tocData.contents && tocData.contents.length === 0 && (
            <p>{t("text_category.message.notfound")}</p>
          )}
          {!isLoading && tocData && tocData.contents && tocData.contents.length > 0 && (
            <div className="toc-container">
              {tocData.contents.map((content, contentIndex) => (
                content.sections && content.sections.map((segment, index) => {
                  const hasChildren = segment.sections && segment.sections.length > 0;

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
                          className={`section-title  ${getLanguageClass(tocData.text_detail.language)}`}
                          onClick={(e) => {
                            e.stopPropagation(); 
                            if (updateChapter && currentChapter) {
                              updateChapter(currentChapter, { 
                                contentIndex: index,
                              });
                            }
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
