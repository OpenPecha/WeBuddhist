
import React, {useState, useMemo} from 'react'
import PaginationComponent from "../../commons/pagination/PaginationComponent.jsx";
import {useTranslate} from "@tolgee/react";
import {FiChevronDown, FiChevronRight} from "react-icons/fi";
import {getEarlyReturn, getLanguageClass, mapLanguageCode} from "../../../utils/helperFunctions.jsx";
import {Link} from "react-router-dom";
import "./TableOfContents.scss"
import PropTypes from "prop-types";
import axiosInstance from "../../../config/axios-config.js";
import {LANGUAGE} from "../../../utils/constants.js";
import {useQuery} from "react-query";

const fetchTextContent = async (textId, skip, pagination) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const {data} = await axiosInstance.get(`/api/v1/texts/${textId}/contents`, {
    params: {
      language,
      limit: pagination.limit,
      skip: skip
    }
  });
  return data;
};

const TableOfContents = ({textId, pagination, setPagination, versionsData}) => {
  const [expandedSections, setExpandedSections] = useState({});
  const { t } = useTranslate();
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);
  const { data: apiData, isLoading:tocIsLoading, error:tocHasError } = useQuery(
    ["texts-content", textId, skip, pagination, localStorage.getItem(LANGUAGE)],
    () => fetchTextContent(textId, skip, pagination),
    { refetchOnWindowFocus: false, enabled: !!textId }
  );

  // -------------------------------------------- helpers ----------------------------------------------

const earlyReturn = getEarlyReturn({isLoading:tocIsLoading , error: tocHasError, t});
if (earlyReturn) return earlyReturn;
  const contents = apiData?.contents || [];
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

  // --------------------------------------------- renderers -------------------------------------------

  const renderContentTree = (section, level = 0, tocId, parentIndex, isTopLevel = false) => {
    const isExpanded = expandedSections[section.id];
    const hasChildren = section.sections && section.sections.length > 0;
    const keyPrefix = isTopLevel ? `content-${tocId}-segment` : `section`;

    const renderContentTitle = () => {
      return <Link
        to={`/chapter?text_id=${textId}&contentId=${tocId}&versionId=&contentIndex=${parentIndex}${!isTopLevel ? `&sectionId=${section.id}` : ''}`}
        className={`toc-title ${getLanguageClass(versionsData?.text?.language)}`}>
        {section.title}
      </Link>
    }

    const renderDropIcons = () => {
      return hasChildren ? (
        isExpanded ?
          <FiChevronDown size={16} className="toggle-icon" /> :
          <FiChevronRight size={16} className="toggle-icon" />
      ) : <span className="empty-icon"></span>
    }

    const renderRecursiveSubContents = () => {
      return isExpanded && hasChildren && (
        <div className="nested-content">
          {section.sections.map((childSection, childIndex) =>
            renderContentTree(childSection, level + 1, tocId, isTopLevel ? childIndex : parentIndex, false)
          )}
        </div>
      )
    }
    return (
      <div key={`${keyPrefix}-${section.id}-${parentIndex}`} className="toc-list-container">
        <div className="toc-header"
          // Prevent toggling if clicking the link
             onClick={(e) => e.target.tagName !== 'A' && toggleSection(section.id)}>
          {renderDropIcons()}
          {renderContentTitle()}
        </div>
        {renderRecursiveSubContents()}
      </div>
    );
  };

  const renderContents = () => {
    return contents.map((content, contentIndex) => (
      content.sections && content.sections.map((segment, index) =>
        renderContentTree(segment, 0, content.id, index, true)
      )
    ));
  };

  const renderPagination = () => {
    return totalSections > 0 ?
      <PaginationComponent
        pagination={pagination}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        setPagination={setPagination}
      /> : <></>;
  };

  return (
    <div className="toc-container">
      {renderContents()}
      {renderPagination()}
    </div>
  );
};

export default React.memo(TableOfContents);

TableOfContents.propTypes = {
  textId: PropTypes.string.isRequired,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired
  }).isRequired,
  setPagination: PropTypes.func.isRequired,
  versionsData: PropTypes.object
}