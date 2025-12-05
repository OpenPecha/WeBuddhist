import React from 'react'
import {getEarlyReturn, getLanguageClass} from "../../../utils/helperFunctions.jsx";
import {Link, useParams} from "react-router-dom";
import {useTranslate} from "@tolgee/react";
import PaginationComponent from "../../commons/pagination/PaginationComponent.jsx";
import "./Versions.scss"
import PropTypes from "prop-types";

const Versions = ({ 
  textId: propTextId, 
  contentId:propContentId,
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
  if(versions.versions.length === 0 && !versions.text) return <div className="content">
    <p className='mt-2'>{t("global.not_found")}</p>
  </div>
  const languageMap = {
    "sa":"language.sanskrit",
    "bo":"language.tibetan",
    "en":"language.english",
    "zh":"language.chinese",
    "it":"language.italian",
    "tib":"language.tibetan",
    "tibphono":"language.tibetan"
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
            <div className={`${getLanguageClass(version.language)} version-title`}>
              {version.title}
            </div>
          </button>
        )
      }
      return <Link
        to={`/chapter?text_id=${version.id}&content_id=${version.table_of_contents[0]}`}
        className="version-title"
      >
        <div className={`${getLanguageClass(version.language)} version-title`}>
          {version.title}
        </div>
      </Link>
    }

    const renderMetadata = (version) => {
      const source = version.source_link || "";
      const license = version.license || "";
      return (
        <div className={`version-metadata en-text`}>
          {source && (
            <div className="metadata-row">
              <span>Source:</span>
              <span>
                {source}
              </span>
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
  
  const renderTexts = () => {
    const renderTitle = (version) => {
      if (addChapter) {
        return (
          <button className="version-title-button" onClick={() => {
            const contentId = propContentId;
            if (contentId) {
              addChapter({
                textId: version.id,
                contentId: contentId,
              }, currentChapter);
            }
          }}>
            <div className={`${getLanguageClass(version.language)} version-title`}>
              {version.title}
            </div>
          </button>
        )
      }
      return <Link
        to={`/chapter?text_id=${version.id}&content_id=${propContentId}&versionId=&contentIndex=${0}`}
        className="version-title"
      >
        <div className={`${getLanguageClass(version.language)} version-title`}>
          {version.title}
        </div>
      </Link>
    }

    const renderMetadata = (version) => {
      const source = version.source_link || "";
      const license = version.license || "";
      return (
        <div className={`version-metadata en-text`}>
          {source && (
            <div className="metadata-row">
              <span>Source:</span>
              <span>
                {source}
              </span>
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

    if (!versions?.text) return null;
    
    const textVersion = versions.text;
    return (
      <div className="version-details" key={textVersion.id}>
        <div className="version-title-subtitle-container">
          {renderTitle(textVersion)}
          {renderMetadata(textVersion)}
        </div>
        {renderLanguage(textVersion)}
      </div>
    )
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
    {
      renderTexts()
    }
    {renderVersions()}
    {/* {renderPagination()} */}
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