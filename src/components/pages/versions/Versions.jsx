import "./Versions.scss"
import {useTranslate} from "@tolgee/react";
import {getLanguageClass, LANGUAGE, mapLanguageCode} from "../../../utils/Constants.js";
import axiosInstance from "../../../config/axios-config.js";
import {useQuery} from "react-query";
import {Link, useParams} from "react-router-dom";
import React, {useMemo, useState} from "react";
import PaginationComponent from "../../commons/pagination/PaginationComponent.jsx";


export const fetchVersions = async (id, limit, skip) => {
  const storedLanguage = sessionStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "bo";

  const {data} = await axiosInstance.get(`/api/v1/texts/${id}/versions`, {
    params: {
      language,
      limit,
      skip
    }
  })
  return data
}

const Versions = ({ contentId }) => {
  const { id } = useParams();
  const { t } = useTranslate();
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);


  const { data: versionsData, isLoading } = useQuery(
    ["texts-versions", id, pagination.currentPage, pagination.limit],
    () => fetchVersions(id, pagination.limit, skip),
    {
      refetchOnWindowFocus: false,
      retry: 1
    }
  );
  const languageMap = {
    "sa":"language.sanskrit",
    "bo":"language.tibetan",
    "en":"language.english"
  }


  if (isLoading) {
    return <div className="notfound listtitle">Loading versions...</div>;
  }

  if (!versionsData || !Array.isArray(versionsData.versions)) {
    return <div className="notfound listtitle">
      <div className="no-content">No content found</div>
    </div>;
  }

  const totalVersions = versionsData?.versions.length || 0;
  const totalPages = Math.ceil(totalVersions / pagination.limit);

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, currentPage: pageNumber }));
  };

  const handleLimitChange = (e) => {
    setPagination({ currentPage: 1, limit: Number(e.target.value) });
  };

  return (
    <div className="versions-container">
      {
        versionsData?.versions.map((version,index) => (
          <React.Fragment key={version.id}>
            <div className="version">
              <div>
                <Link
                  // TODO to={`/texts/text-details?text_id=${id}&version_id=${version.id}`}
                  to={`/texts/text-details?text_id=${id}`}
                  className="section-title"
                  state={{chapterInformation: {contentId: contentId, versionId: version.id,contentindex:0}}}
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