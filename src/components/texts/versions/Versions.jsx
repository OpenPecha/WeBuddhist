import React from 'react'
import {getEarlyReturn, getLanguageClass} from "../../../utils/helperFunctions.jsx";
import {Link, useParams} from "react-router-dom";
import {useTranslate} from "@tolgee/react";
import PaginationComponent from "../../commons/pagination/PaginationComponent.jsx";
import "./Versions.scss"
import PropTypes from "prop-types";

const Versions = ({ 
  textId: propTextId, 
  requiredInfo, 
  addChapter, 
  currentChapter, 
  versions, 
  versionsIsLoading, 
  versionsIsError, 
  versionsPagination, 
  setVersionsPagination 
}) => {
  const { id: urlId } = useParams();
  const { t } = useTranslate();
  
  const textId = propTextId || urlId;

  // -------------------------------------------- helpers ----------------------------------------------

  const earlyReturn = getEarlyReturn({isLoading: versionsIsLoading, error: versionsIsError, t});
  if (earlyReturn) return earlyReturn;
  if(versions.versions.length === 0) return <div className="listtitle">
    <p>{t("text.version.notfound")}</p>
  </div>
  const languageMap = {
    "sa":"language.sanskrit",
    "bo":"language.tibetan",
    "en":"language.english",
    "zh":"language.chinese",
    "it":"language.italian"
  }

  const totalVersions = versions?.versions.length || 0;
  const totalPages = Math.ceil(totalVersions / versionsPagination.limit);

  const handlePageChange = (pageNumber) => {
    setVersionsPagination(prev => ({ ...prev, currentPage: pageNumber }));
  };


  // --------------------------------------------- renderers -------------------------------------------


  const renderVersions = () => {
    const renderTitle = (version) => {
      if (addChapter) {
        return (
          <button className="version-title-button" onClick={() => {
            const contentId = version.table_of_contents[0];
            if (contentId) {
              addChapter({
                textId: version.id,
                contentId: contentId,
              }, currentChapter);
            }
          }}>
            <div className={`${getLanguageClass(version.language)}`}>
              {version.title}
            </div>
          </button>
        )
      }
      return <Link
        to={`/chapter?text_id=${version.id}&content_id=${version.table_of_contents[0]}`}
        className="version-title"
      >
        <div className={`${getLanguageClass(version.language)}`}>
          {version.title}
        </div>
      </Link>
    }

    const renderMetadata = (version) => {
      const source = version.source || "";
      const sourceUrl = version.source_url || "#";
      const license = version.license || "";
      return (
        <div className="version-metadata">
          {source && (
            <div className="metadata-row">
              <span>Source:</span>
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                {source}
              </a>
            </div>
          )}
          {license && (
            <div className="metadata-row">
              <span>License:</span>
              <span>{license}</span>
            </div>
          )}
        </div>
      )
    }
    
    const renderLanguage = (version) => {
      return <div className="version-language subtitle border">
        <p>{t(languageMap[version.language])}</p>
      </div>
    }

    return versions?.versions.map((version) => (
        <div className="version-details" key={version.id}>
          <div className="version-title-subtitle-container">
            {renderTitle(version)}
            {renderMetadata(version)}
          </div>
          {renderLanguage(version)}
        </div>
    ))
  }
  const renderPagination = () => {
    return versions?.versions?.length > 0 ?
      <PaginationComponent
        pagination={versionsPagination}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        setPagination={setVersionsPagination}
      /> :<></>
  }

  return <div className="versions-container">
    {renderVersions()}
    {renderPagination()}
  </div>
}

export default React.memo(Versions)
Versions.propTypes = {
  textId: PropTypes.string,
  requiredInfo: PropTypes.shape({
    from: PropTypes.string
  }),
  addChapter: PropTypes.func,
  currentChapter: PropTypes.object,
  versions: PropTypes.object,
  versionsIsLoading: PropTypes.bool,
  versionsIsError: PropTypes.object,
  versionsPagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired
  }),
  setVersionsPagination: PropTypes.func
};