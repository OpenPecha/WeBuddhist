import React, { useState } from 'react';
import './Content.scss';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { LANGUAGE, mapLanguageCode } from '../../../utils/Constants';
import axiosInstance from '../../../config/axios-config';
import { useQuery } from 'react-query';

const fetchTextContent = async (text_id) => {
  try {
    const storedLanguage = localStorage.getItem(LANGUAGE);
    const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
    const { data } = await axiosInstance.get(`api/v1/texts/${text_id}/contents`, {
      params: {
        language,
        limit: 10,
        skip: 0
      }
    });
    return data;
  } catch (error) {
    return null;
  }
};

const Content = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const textid = "9b603059-d8b4-42b2-9211-60d058c33480";

  const { data: apiData, isLoading } = useQuery(
    ["texts", textid],
    () => fetchTextContent(textid),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20,
      retry: 1,
    }
  );
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderSection = (section, level = 0) => {
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
          <span>{section.title}</span>
        </div>

        {isExpanded && hasChildren && (
          <div className="nested-content">
            {section.sections.map((childSection) => 
              renderSection(childSection, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <div>Loading content...</div>;

  if (!apiData || apiData.length === 0) {
    return <div className="no-content listtitle ">No content found</div>;
  }

  return (
    <div>
      <div className="listtitle">
        {apiData?.segments.map((segment, segmentIndex) => {
          const hasChildren = segment.sections && segment.sections.length > 0;

          return (
            <div key={`segment-${segment.id}-${segmentIndex}`} className="section-container">
              <div 
                className="section-header"
                onClick={() => toggleSection(segment.id)}
              >
                {hasChildren ? (
                  expandedSections[segment.id] ? 
                    <FiChevronDown size={16} className="toggle-icon" /> : 
                    <FiChevronRight size={16} className="toggle-icon" />
                ) : <span className="empty-icon"></span>}
                <span>{segment.title}</span>
              </div>

              {expandedSections[segment.id] && hasChildren && (
                <div className="nested-content">
                  {segment.sections.map((section) => 
                    renderSection(section, 1)
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Content;