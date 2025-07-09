
import React, {useMemo, useState} from 'react'
import {useQuery} from "react-query";
import {getEarlyReturn, getLanguageClass, mapLanguageCode} from "../../utils/helperFunctions.jsx";
import "./Texts.scss"
import {LANGUAGE} from "../../utils/constants.js";
import axiosInstance from "../../config/axios-config.js";
import {useTranslate} from "@tolgee/react";
import {useParams, useSearchParams} from "react-router-dom";
import {FiChevronDown} from "react-icons/fi";
import TableOfContents from "./table-of-contents/TableOfContents.jsx";
import Versions from "./versions/Versions.jsx";

const fetchVersions = async (id, limit, skip) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const { data } = await axiosInstance.get(`/api/v1/texts/${id}/versions`, {
    params: { 
      language, 
      limit, 
      skip
    }
  });
  return data;

}
const Texts = () => {
  const { t } = useTranslate();
  const { id: urlId } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || "";
  const [activeTab, setActiveTab] = useState('contents');
  const [downloadOptionSelections, setDownloadOptionSelections] = useState({format: '', version: ''});
  const [contentsPagination, setContentsPagination] = useState({ currentPage: 1, limit: 10 });
  const [versionsPagination, setVersionsPagination] = useState({ currentPage: 1, limit: 10 });
  const skipVersions = useMemo(() => (versionsPagination.currentPage - 1) * versionsPagination.limit, [versionsPagination]);

  const { data: versionsData, isLoading: versionsIsLoading, error: versionsIsError } = useQuery(
    ["texts-versions", urlId, versionsPagination.currentPage, versionsPagination.limit, localStorage.getItem(LANGUAGE)],
    () => fetchVersions(urlId, versionsPagination.limit, skipVersions),
    { refetchOnWindowFocus: false, enabled: !!urlId }
  );

  const textId = versionsData?.text?.id;

  const earlyReturn = getEarlyReturn({isLoading: versionsIsLoading, error: versionsIsError, t});
  if (earlyReturn) return earlyReturn;

  // --------------------------------------------- renderers -------------------------------------------
  const renderTextTitleAndType = () => {
    const renderTitle = () => {
      return <h3 className={`${getLanguageClass(versionsData?.text?.language)}`}>{versionsData?.text?.title}</h3>
    }

    const renderType = () => {
      return <div className="navbaritems subcom">
        {t(`text.type.${type}`)}
      </div>
    }

    return(
      <div className="title-type-container">
        {renderTitle()}
        {renderType()}
      </div>
    )
  }

  const renderContinueReadingButton = () => {

    return <button className="navbaritems continue-reading-button">
      {t("text.button.continue_reading")}
    </button>

  }

  const renderTabs = () => {
    return <div className="tab-container listsubtitle">
      {/* Tab Navigation */}
      <div className="tab-nav">
        <button
          className={`tab-button ${activeTab === 'contents' ? 'active' : ''}`}
          onClick={() => setActiveTab('contents')}
        >
          {t("text.contents")}
        </button>
        <button
          className={`tab-button ${activeTab === 'versions' ? 'active' : ''}`}
          onClick={() => setActiveTab('versions')}
        >
          {t("common.version")}
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'contents' && (
          <div className="tab-panel">
            <TableOfContents textId={textId} pagination={contentsPagination} setPagination={setContentsPagination} versionsData={versionsData} />
          </div>
        )}
        {activeTab === 'versions' && (
          <div className="tab-panel">
            <Versions versionsData={versionsData} pagination={versionsPagination} setPagination={setVersionsPagination} />
          </div>
        )}
      </div>
    </div>
  }


  const renderDownloadTextOptions = () => {
    const renderTitle = () => {
      return <p className="download-text-title navbaritems">{t("side_nav.download_text")}</p>
    }
    const renderSelectVersion = () => {
      return <div className="select-version">
        <label className="navbaritems">{t("side_nav.download_text.select_version")}</label>
        <div className="select-wrapper">
          <select
            className="navbaritems"
            value={downloadOptionSelections.version}
            onChange={(e) =>
              setDownloadOptionSelections(prev =>
                ({...prev, version: e.target.value}))
            }>
            <option value="" disabled>
              {t("side_nav.download_text.select_version")}
            </option>
            <option value="version1">Sample version</option>
          </select>
          <FiChevronDown size={16}/>
        </div>
      </div>
    }

    const renderSelectFormat = () => {
      return <div className="select-format">
        <label className="navbaritems">{t("side_nav.download_text.select_format")}</label>
        <div className="select-wrapper">
          <select
            className="navbaritems"
            value={downloadOptionSelections.format}
            onChange={(e) =>
              setDownloadOptionSelections((prev) => ({...prev, format: e.target.value}))
            }>
            <option value="" disabled>
              {t("side_nav.download_text.select_format")}
            </option>
            <option value="textwithtag">
              {t("side_nav.download_text.text_with_tag")}
            </option>
            <option value="textwithouttag">
              {t("side_nav.download_text.text_without_tag")}
            </option>
            <option value="epub">
              {t("side_nav.download_text.json")}
            </option>
            <option value="csv">{t("side_nav.download_text.csv")}</option>
          </select>
          <FiChevronDown size={16}/>
        </div>
      </div>
    }

    return <div className="download-options-container">
      {renderTitle()}
      {renderSelectVersion()}
      {renderSelectFormat()}
    </div>

  }

  return (
    <div className="texts-container">
      <div className="left-section">
        {renderTextTitleAndType()}
        {renderContinueReadingButton()}
        {renderTabs()}
      </div>
      <div className="right-section">
        {renderDownloadTextOptions()}
      </div>
    </div>
  )
}

export { fetchVersions };
export default Texts