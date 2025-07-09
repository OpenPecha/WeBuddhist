import React from 'react'
import {useTranslate} from "@tolgee/react";
import PaginationComponent from "../../commons/pagination/PaginationComponent.jsx";
import {getLanguageClass} from "../../../utils/helperFunctions.jsx";
import {Link} from "react-router-dom";
import "./Versions.scss"

const Versions = ({ versionsData, pagination, setPagination }) => {
  const { t } = useTranslate();
  const languageMap = {
    "sa":"language.sanskrit",
    "bo":"language.tibetan",
    "en":"language.english"
  }

  if (!versionsData) {
    return <div className="notfound listtitle">Loading versions...</div>;
  }
  if (!versionsData.versions || versionsData.versions.length === 0) {
    return <div className="notfound listtitle">
      <div className="no-content">{t("text.version.notfound")}</div>
    </div>;
  }

  const totalVersions = versionsData?.versions.length || 0;
  const totalPages = Math.ceil(totalVersions / pagination.limit);

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, currentPage: pageNumber }));
  };


  // --------------------------------------------- renderers -------------------------------------------


  const renderVersions = () => {

    const renderTitle = (version) => {
      return <Link
        to={`/chapter?text_id=${version.id}&contentId=${version.table_of_contents[0]}&versionId=${version.id}&contentIndex=0`} /* NOTE : should be updated */
        className="version-title"
      >
        <div className={`${getLanguageClass(version.language)}`}>
          {version.title}
        </div>
      </Link>
    }

    const renderSubtitle = () => {
      return <div className="version-subtitle subtitle">
        {t("text.versions.information.review_history")}
      </div>
    }

    const renderLanguage = (version) => {
      return <div className="version-language subtitle border">
        <p>{t(languageMap[version.language])}</p>
      </div>
    }

    return versionsData?.versions.map((version) => (
      <React.Fragment key={version.id}>
        <div className="version-details">
          <div className="version-title-subtitle-container">
            {renderTitle(version)}
            {renderSubtitle()}
          </div>
          {renderLanguage(version)}
        </div>
        <hr/>
      </React.Fragment>
    ))
  }
  const renderPagination = () => {
    return versionsData.versions.length > 0 ?
      <PaginationComponent
        pagination={pagination}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        setPagination={setPagination}
      /> :<></>
  }

  return <div className="versions-container">
    {renderVersions()}
    {renderPagination()}
  </div>
}

export default React.memo(Versions)