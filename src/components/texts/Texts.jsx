
import React, {useMemo, useState} from 'react'
import {useQuery} from "react-query";
import {getEarlyReturn, getLanguageClass, mapLanguageCode} from "../../utils/helperFunctions.jsx";
import "./Texts.scss"
import {LANGUAGE} from "../../utils/constants.js";
import axiosInstance from "../../config/axios-config.js";
import {useTranslate} from "@tolgee/react";
import {useParams} from "react-router-dom";
import {FiChevronDown} from "react-icons/fi";
import TableOfContents from "./table-of-contents/TableOfContents.jsx";
import Versions from "./versions/Versions.jsx";
const fetchTableOfContents = async (textId, skip, limit) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const {data} = await axiosInstance.get(`/api/v1/texts/${textId}/contents`, {
    params: {
      language,
      limit: limit,
      skip: skip
    }
  });
  return data;

}
const Texts = () => {
  const { t } = useTranslate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('contents');
  const [downloadOptionSelections, setDownloadOptionSelections] = useState({format: '', version: ''});
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination?.currentPage - 1) * pagination?.limit, [pagination]);

  const {data: tableOfContents, isLoading: tableOfContentsIsLoading, error: tableOfContentsIsError} = useQuery(
    ["table-of-contents", skip],
    () => fetchTableOfContents(id, skip, pagination.limit),
    {refetchOnWindowFocus: false, enabled: !!id}
  );

  // -------------------------------------------- helpers ----------------------------------------------

  const earlyReturn = getEarlyReturn({isLoading: tableOfContentsIsLoading, error: tableOfContentsIsError, t});
  if (earlyReturn) return earlyReturn;

  // --------------------------------------------- renderers -------------------------------------------
  const renderTextTitleAndType = () => {
    const renderTitle = () => {
      return <h3 className={`${getLanguageClass(tableOfContents.text_detail.language)}`}>
        {tableOfContents.text_detail.title}
      </h3>
    }

    const renderType = () => {
      return <div className="navbaritems subcom">
        {t(`text.type.${tableOfContents.text_detail.type}`)}
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
            <TableOfContents tableOfContents={tableOfContents} pagination={pagination} setPagination={setPagination}/>
          </div>
        )}
        {activeTab === 'versions' && (
          <div className="tab-panel">
            <Versions />
          </div>
        )}
      </div>
    </div>
  }


  const renderDownloadTextOptions = () => {
    const renderTitle = () => {
      return <p className="download-text-title">{t("side_nav.download_text")}</p>
    }
    const renderSelectVersion = () => {
      return <div className="select-version">
        <label>{t("side_nav.download_text.select_version")}</label>
        <div className="select-wrapper">
          <select
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
        <label>{t("side_nav.download_text.select_format")}</label>
        <div className="select-wrapper">
          <select
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

export default Texts