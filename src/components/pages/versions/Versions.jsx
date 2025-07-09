import "./Versions.scss"
import {useTranslate} from "@tolgee/react";
import {Link} from "react-router-dom";
import React from "react";
import PaginationComponent from "../../commons/pagination/PaginationComponent.jsx";
import {getLanguageClass} from "../../../utils/helperFunctions.jsx";
import PropTypes from "prop-types";
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
  if (versionsData.versions.length === 0) {
    return <div className="notfound listtitle">
      <div className="no-content">{t("text.version.notfound")}</div>
    </div>;
  }

  const totalVersions = versionsData?.versions.length || 0;
  const totalPages = Math.ceil(totalVersions / pagination.limit);

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, currentPage: pageNumber }));
  };

  return (
    <div className="versions-container">
      {
        versionsData?.versions.map((version) => (
          <React.Fragment key={version.id}>
            <div className="version">
              <div>
                <Link
                  to={`/chapter?text_id=${version.id}&contentId=${version.table_of_contents[0]}&versionId=${version.id}&contentIndex=0`}
                  className="section-title"
                >
                  <div className={`${getLanguageClass(version.language)} titleversion`}>
                    {version.title}
                  </div>
                </Link>
                <div className="review-history subtitle">
                  {t("text.versions.information.review_history")}
                </div>
              </div>
              <div className="version-language subtitle border">
                <p>{t(languageMap[version.language])}</p>
              </div>
            </div>
            <hr/>
          </React.Fragment>
        ))
      }

      {versionsData.versions.length > 0 &&
        <PaginationComponent
          pagination={pagination}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          setPagination={setPagination}
        />}
    </div>
  )
}
export default Versions
Versions.propTypes = {
  versionsData: PropTypes.shape({
    versions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        language: PropTypes.string.isRequired,
        table_of_contents: PropTypes.array.isRequired
      })
    ).isRequired
  }), 
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired
  }).isRequired, 
  setPagination: PropTypes.func.isRequired
}