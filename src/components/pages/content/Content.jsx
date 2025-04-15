import React, { useMemo, useState, useEffect } from 'react';
import './Content.scss';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { LANGUAGE, mapLanguageCode, getLanguageClass } from '../../../utils/Constants';
import axiosInstance from '../../../config/axios-config';
import { useQuery } from 'react-query';
import { useParams, Link } from 'react-router-dom';
import PaginationComponent from '../../commons/pagination/PaginationComponent';

export const fetchTextContent = async (text_id) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const {data} = await axiosInstance.get(`/api/v1/texts/${text_id}/contents`, {
    params: {
      language,
      limit: 10,
      skip: 0
    }
  });
  return data;
};

const Content = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const { id } = useParams();
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);
  const { data: apiData, isLoading, error } = useQuery(
    ["texts", id],
    () => fetchTextContent(id),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20,
      retry: 1,
    }
  );


  if (isLoading) return <div>Loading content...</div>;
  
  if (error) return <div className="no-content listtitle">Error loading content: {error.message}</div>;

  if (!apiData || !apiData.contents || apiData.contents.length === 0) {
    return <div className="no-content listtitle">No content found</div>;
  }

  // useEffect(() => {
  //   if (apiData?.contents?.[0]?.segments) {
  //     const initialExpandedState = {};
  //     // Only set the first level segments to expanded
  //     apiData.contents[0].segments.forEach(segment => {
  //       initialExpandedState[segment.id] = true;
  //     });
  //     setExpandedSections(initialExpandedState);
  //   }
  // }, [apiData]);

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
          <Link
            to={`/texts/text-details?text_id=${id}`}
            className={`section-title ${getLanguageClass(apiData.text_detail.language)}`}
            state={{chapterInformation: {contentId: section.id, versionId: ""}}}
          >
            {section.title}
          </Link>
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

  const handleLimitChange = (e) => {
    setPagination({ currentPage: 1, limit: Number(e.target.value) });
  };

  return (
    <div>
      <div className="listtitle">
        {contents.map((content, contentIndex) => (
          content.sections && content.sections.map((segment, segmentIndex) => {
            const hasChildren = segment.sections && segment.sections.length > 0;

            return (
              <div key={`content-${contentIndex}-segment-${segment.id}-${segmentIndex}`} className="section-container">
                <div 
                  className="section-header"
                  onClick={() => toggleSection(segment.id)}
                >
                  {hasChildren ? (
                    expandedSections[segment.id] ? 
                      <FiChevronDown size={16} className="toggle-icon" /> : 
                      <FiChevronRight size={16} className="toggle-icon" />
                  ) : <span className="empty-icon"></span>}
                  <Link 
                    to={`/texts/text-details?text_id=${id}`}
                    className={`section-title ${getLanguageClass(apiData.text_detail.language)}`}
                    state={{chapterInformation: {contentId: content.id, versionId: "", initialSegmentIndex: segmentIndex}}}
                  >
                    {segment.title}
                  </Link>
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
          })
        ))}
      </div>
      {totalSections > 0 &&
        <PaginationComponent
          pagination={pagination}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          setPagination={setPagination}
        />}
    </div>
  );
};

export default Content;