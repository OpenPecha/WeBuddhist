import React, { useMemo, useState } from 'react';
import './Content.scss';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { LANGUAGE, mapLanguageCode, getLanguageClass } from '../../../utils/Constants';
import axiosInstance from '../../../config/axios-config';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import PaginationComponent from '../../commons/pagination/PaginationComponent';
import { useTranslate } from "@tolgee/react";
export const fetchTextContent = async (text_id, skip, pagination) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const {data} = await axiosInstance.get(`/api/v1/texts/${text_id}/contents`, {
    params: {
      language,
      limit: pagination.limit,
      skip: skip
    }
  });
  return data;
};

const Content = ({textId, setContentId}) => {
  const [expandedSections, setExpandedSections] = useState({});
  const id = textId;
  const { t } = useTranslate();
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);
  const {data: apiData, isLoading, error} = useQuery(
    ["texts-content", id, skip,pagination],
    () => fetchTextContent(id,skip,pagination),
    {
      refetchOnWindowFocus: false,
      retry: 1,
      onSuccess: (data) => {
          setContentId(data.contents[0].id);
      },
      enabled: !!id
    }
  );


  if (isLoading) return <div className="listsubtitle">{t("common.loading")}</div>;
  
  if (error) return <div className="no-content listtitle">Error loading content: {error.message}</div>;

  if (!apiData || !apiData.contents || apiData.contents.length === 0) {
    return <div className="no-content listtitle">No content found</div>;
  }


  const contents = apiData?.contents;
  const totalSections = contents.reduce((total, content) => {
    return total + (content?.sections?.length || 0);
  }, 0);
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

  const renderSection = (section, level = 0, contentId, parentIndex) => {
    const isExpanded = expandedSections[section.id];
    const hasChildren = section.sections && section.sections.length > 0;

    return (
      <div key={`section-${section.id}`} className="section-container">
     
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
            to={`/texts/text-details?text_id=${id}&contentId=${contentId}&versionId=&contentIndex=${parentIndex}&sectionId=${section.id}`}
            className={`section-title ${getLanguageClass(apiData.text_detail.language)}`}
          >
            {section.title}
          </Link>
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

  const handleLimitChange = (e) => {
    setPagination({ currentPage: 1, limit: Number(e.target.value) });
  };

  return (
    <>
      {contents.map((content, contentIndex) => (
        content.sections && content.sections.map((segment, index) => {
          const hasChildren = segment.sections && segment.sections.length > 0;

          return (
              <div key={`content-${contentIndex}-segment-${segment.id}-${index}`} className="section-container">
                <div 
                  className="section-header"
                  onClick={(e) => {
                    if (e.target.tagName !== 'A') {
                      toggleSection(segment.id);
                    }
                  }}
                >
                  {hasChildren ? (
                    expandedSections[segment.id] ? 
                      <FiChevronDown size={16} className="toggle-icon" /> : 
                      <FiChevronRight size={16} className="toggle-icon" />
                  ) : <span className="empty-icon"></span>}
                  <Link 
                    to={`/texts/text-details?text_id=${id}&contentId=${content.id}&versionId=&contentIndex=${index}`}
                    className={`section-title ${getLanguageClass(apiData.text_detail.language)}`}
                  >
                    {segment.title}
                  </Link>
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
   
      {totalSections > 0 &&
        <PaginationComponent
          pagination={pagination}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          setPagination={setPagination}
        />}
    </>
  );
};

export default Content;