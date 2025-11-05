import React, {useMemo, useState} from 'react'
import {LANGUAGE} from "../../../utils/constants.js";
import {getEarlyReturn, getLanguageClass, mapLanguageCode} from "../../../utils/helperFunctions.jsx";
import axiosInstance from "../../../config/axios-config.js";
import {Link, useParams} from "react-router-dom";
import {useQuery} from "react-query";
import {useTranslate} from "@tolgee/react";
import PaginationComponent from "../../commons/pagination/PaginationComponent.jsx";
import "./Versions.scss"
import PropTypes from "prop-types";

export const fetchVersions = async (textId, skip, limit) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "en";
  const {data} = await axiosInstance.get(`/api/v1/texts/${textId}/versions`, {
    params: {
      language,
      limit,
      skip
    }
  })
  return data
}
const Versions = ({ textId: propTextId, requiredInfo, addChapter, currentChapter }) => {
  const { id: urlId } = useParams();
  const { t } = useTranslate();
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination?.currentPage - 1) * pagination?.limit, [pagination]);
  
  const textId = propTextId || urlId;

  const {data: versions, isLoading: versionsIsLoading, error: versionsIsError} = useQuery(
    ["versions", textId, skip, pagination.limit],   
    () => fetchVersions(textId, skip, pagination.limit),
    {refetchOnWindowFocus: false, enabled: !!textId}
  );

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
    "zh":"language.chinese"
  }

  const totalVersions = versions?.versions.length || 0;
  const totalPages = Math.ceil(totalVersions / pagination.limit);

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, currentPage: pageNumber }));
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

    return versions?.versions.map((version) => (
      <>
        <div className="version-details" key={version.id}>
          <div className="version-title-subtitle-container">
            {renderTitle(version)}
            {renderSubtitle()}
          </div>
          {renderLanguage(version)}
        </div>
        <hr/>
      </>
    ))
  }
  const renderPagination = () => {
    return versions.versions.length > 0 ?
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
Versions.propTypes = {
  textId: PropTypes.string,
  requiredInfo: PropTypes.shape({
    from: PropTypes.string
  }),
  addChapter: PropTypes.func,
  currentChapter: PropTypes.object
};