import "./Versions.scss"
import {useTranslate} from "@tolgee/react";
import {LANGUAGE, mapLanguageCode} from "../../../utils/Constants.js";
import axiosInstance from "../../../config/axios-config.js";
import {useQuery} from "react-query";
import {useParams} from "react-router-dom";
import React, {useMemo, useState} from "react";
import PaginationComponent from "../../commons/pagination/PaginationComponent.jsx";


export const fetchVersions = async (id, limit, skip) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "bo";

  const {data} = await axiosInstance.get(`api/v1/texts/${id}/versions`, {
    language,
    limit,
    skip
  })
  return data

}
const Versions = () =>{
  const { id } = useParams();
  const { t } = useTranslate();
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);


  // const { data: versionsData, isLoading } = useQuery(
  //   ["texts", id, pagination.currentPage, pagination.limit],
  //   () => fetchVersions(id, pagination.limit, skip),
  //   {
  //     refetchOnWindowFocus: false,
  //     staleTime: 1000 * 60 * 20,
  //     retry: 1
  //   }
  // );
  const languageMap = {
    "sa":"language.sanskrit",
    "bo":"language.tibetan",
    "en":"language.english"
  }

  // if (isLoading) {
  //   return <div className="notfound listtitle">Loading content...</div>;
  // }

  // if (!versionsData || !Array.isArray(versionsData.versions)) {
  //   return <div className="notfound listtitle">
  //     <div className="no-content">No content found</div>
  //   </div>;
  // }

  const versionsData = {
    data : [
      {
        "id": "uuid.v4",
        "title": "शबोधिचर्यावतार[sa]",
        "parent_id": "d19338e",
        "priority": 1,
        "language": "sa",
        "type": "translation",
        "is_published": true,
        "created_date": "2021-09-01T00:00:00.000Z",
        "updated_date": "2021-09-01T00:00:00.000Z",
        "published_date": "2021-09-01T00:00:00.000Z",
        "published_by": "buddhist_tab"
      },
      {
        "id": "uuid.v4",
        "title": "བྱང་ཆུབ་སེམས་དཔའི་སྤྱོད་པ་ལ་འཇུག་པ།",
        "language": "bo",
        "parent_id": "d19338e",
        "priority": 2,
        "type": "translation",
        "is_published": true,
        "created_date": "2021-09-01T00:00:00.000Z",
        "updated_date": "2021-09-01T00:00:00.000Z",
        "published_date": "2021-09-01T00:00:00.000Z",
        "published_by": "buddhist_tab"
      },
      {
        "id": "uuid.v4",
        "title": "The Way of the Bodhisattva Monlam AI Draft",
        "language": "en",
        "parent_id": "d19338e",
        "priority": 3,
        "type": "translation",
        "is_published": true,
        "created_date": "2021-09-01T00:00:00.000Z",
        "updated_date": "2021-09-01T00:00:00.000Z",
        "published_date": "2021-09-01T00:00:00.000Z",
        "published_by": "buddhist_tab"
      }
    ],
    total: 10,
    skip: 0,
    limit: 10
  }
  const totalVersions = versionsData?.total || 0;
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
        versionsData?.data.map((version,index) => <>
          <div  key={index} className="version">
            <div>
              <div className="version-title listtitle">
                {version.title}
                <br/>
              </div>
              <div className="review-history">
                Revision History
              </div>
            </div>
            <div className="version-language">
              {t(languageMap[version.language])}
            </div>
          </div>
          <hr/>
        </>)
      }

      {versionsData.data.length > 0 &&
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