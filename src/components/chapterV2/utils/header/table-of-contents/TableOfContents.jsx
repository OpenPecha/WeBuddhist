import React, { useState } from "react";
import { useTranslate } from "@tolgee/react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import PropTypes from "prop-types";
import axiosInstance from "../../../../../config/axios-config.js";
import { LANGUAGE } from "../../../../../utils/constants.js";
import { mapLanguageCode, getLanguageClass, getEarlyReturn } from "../../../../../utils/helperFunctions.jsx";
import { Link } from "react-router-dom";
import "./TableOfContents.scss";
import { useQuery } from "react-query";

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

const TableOfContents = ({ textId, showTableOfContents }) => {
  const { t } = useTranslate();
  const [expandedSections, setExpandedSections] = useState({});

  const { data: tableOfContents, error, isLoading } = useQuery(
    ["toc", textId],
    () => fetchTableOfContents(textId),
    {
      enabled: !!textId,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20,
    }
  );

  // -------------------------------------------- helpers ----------------------------------------------
  const earlyReturn = getEarlyReturn({loading: isLoading, error: error, t});
  if (earlyReturn) return earlyReturn;

  const contentData = tableOfContents?.contents || [];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // --------------------------------------------- renderers -------------------------------------------
  const renderSectionTree = (section, contentId) => {
    const isExpanded = expandedSections[section.id];
    const hasChildren = section.sections && section.sections.length > 0;
    const segmentId = hasChildren 
      ? section.sections[0]?.segments?.[0]?.segment_id 
      : section.segments?.[0]?.segment_id;

    return (
      <div key={section.id} className="section-container">
        <button 
          className="section-header"
          onClick={(e) => e.target.tagName !== 'A' && toggleSection(section.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <FiChevronDown size={16} className="toggle-icon" />
            ) : (
              <FiChevronRight size={16} className="toggle-icon" />
            )
          ) : (
            <span className="empty-icon"></span>
          )}
          <Link
            to={`/chapter?text_id=${textId}&content_id=${contentId}&segment_id=${segmentId}`}
            className={`section-title ${getLanguageClass(tableOfContents?.text_detail?.language)}`}
          >
            {section.title}
          </Link>
        </button>
        {isExpanded && hasChildren && (
          <div className="nested-content">
            {section.sections.map((childSection) =>
              renderSectionTree(childSection, contentId)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTocContent = () => {
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
    <div className={`table-of-contents ${showTableOfContents ? 'show' : ''}`}>
      <div className="headerthing">
        <p className="listtitle">{t("text.table_of_contents")}</p>
      </div>
      <div className="toc-content">
        <div className="toc-container">
          {renderTocContent()}
        </div>
      </div>
    </div>
  );
};

export default React.memo(TableOfContents);

TableOfContents.propTypes = {
  textId: PropTypes.string.isRequired,
  showTableOfContents: PropTypes.bool
};