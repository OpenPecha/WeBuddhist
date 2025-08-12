import React, {useMemo, useState} from 'react'
import {useQuery} from "react-query";
import {getLanguageClass, mapLanguageCode} from "../../utils/helperFunctions.jsx"; 
import {useDynamicTabTitle} from "../../utils/dynamicTitle.jsx";
import "./Texts.scss"
import {LANGUAGE} from "../../utils/constants.js";
import axiosInstance from "../../config/axios-config.js";
import {useTranslate} from "@tolgee/react";
import {Link, useParams, useSearchParams} from "react-router-dom";
import {FiChevronDown} from "react-icons/fi";
import TableOfContents from "./table-of-contents/TableOfContents.jsx";
import Versions from "./versions/Versions.jsx";
export const fetchTableOfContents = async (textId, skip, limit, languageFromContent = null) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const fallbackLanguage = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const language = languageFromContent || fallbackLanguage;
  const {data} = await axiosInstance.get(`/api/v1/texts/${textId}/contents`, {
    params: {
      language,
      limit: limit,
      skip: skip
    }
  });
  return data;

}

export const tabNavigation = (activeTab, setActiveTab, t) => {
  const contentsClass = activeTab === "contents" ? "active" : "";
  const versionsClass = activeTab === "versions" ? "active" : "";
  
  return (
    <div className="tab-nav">
      <button
        className={`tab-button ${contentsClass}`}
        onClick={() => setActiveTab("contents")}
      >
        {t("text.contents")}
      </button>
      <button
        className={`tab-button ${versionsClass}`}
        onClick={() => setActiveTab("versions")}
      >
        {t("common.version")}
      </button>
    </div>
  );
}

export const tabContent = (activeTab, tableOfContents, pagination, setPagination, textId, tableOfContentsIsError, tableOfContentsIsLoading, t, onContentItemClick) => {
  return (
    <div className="tab-content">
      {activeTab === 'contents' && (
        <div className="tab-panel">
          <TableOfContents 
            tableOfContents={tableOfContents} 
            pagination={pagination} 
            setPagination={setPagination} 
            textId={textId}
            error={tableOfContentsIsError}
            loading={tableOfContentsIsLoading}
            t={t}
            onContentItemClick={onContentItemClick}
          />
        </div>
      )}
    </div>
  )
}

export const tabVersion = (activeTab, textId) => {
  return (
    <div className="tab-content">
      {activeTab === 'versions' && (
        <div className="tab-panel">
          <Versions textId={textId}/>
        </div>
      )}
    </div>
  )
}

export const renderTabs = (activeTab, setActiveTab, tableOfContents, pagination, setPagination, tableOfContentsIsError, tableOfContentsIsLoading, t, textId, onContentItemClick) => {
  return (
    <div className="tab-container listsubtitle">
      {tabNavigation(activeTab, setActiveTab, t)}
      {tabContent(activeTab, tableOfContents, pagination, setPagination, textId, tableOfContentsIsError, tableOfContentsIsLoading, t, onContentItemClick)}
      {tabVersion(activeTab, textId)}
    </div>
  )
}

const Texts = () => {
  const { t } = useTranslate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || "";
  const [activeTab, setActiveTab] = useState('contents');
  const [downloadOptionSelections, setDownloadOptionSelections] = useState({format: '', version: ''});
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination?.currentPage - 1) * pagination?.limit, [pagination]);

  const {data: tableOfContents, isLoading: tableOfContentsIsLoading, error: tableOfContentsIsError} = useQuery(
    ["table-of-contents", skip],
    () => fetchTableOfContents(id, skip, pagination.limit),
    {refetchOnWindowFocus: false, enabled: !!id, retry: false}
  );

  // -------------------------------------------- helpers ----------------------------------------------
  const handleOptionChange = (e, type) => { setDownloadOptionSelections(prev =>({...prev, [type]: e.target.value})) }
  useDynamicTabTitle(tableOfContents?.text_detail?.title);


  // --------------------------------------------- renderers -------------------------------------------
  const renderTextTitleAndType = () => {
    const renderTitle = () => {
      return <h3 className={`${getLanguageClass(tableOfContents?.text_detail.language)}`}>
        {tableOfContents?.text_detail.title}
      </h3>
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
    return <Link className="navbaritems continue-reading-button"
                 to={`/chapter?text_id=${tableOfContents?.text_detail?.id}&contentId=${tableOfContents?.contents[0]?.id}&versionId=&contentIndex=${0}`}>
      {t("text.button.continue_reading")}
    </Link>
  }

  const renderTabsLocal = () => {
    return renderTabs(activeTab, setActiveTab, tableOfContents, pagination, setPagination, tableOfContentsIsError, tableOfContentsIsLoading, t, id);
  }

  const renderVersionsDropdown = () => <div className="select-version">
    <label className="navbaritems">{t("side_nav.download_text.select_version")}</label>
    <div className="select-wrapper">
      <select
        className="navbaritems"
        value={downloadOptionSelections.version}
        onChange={(e) => handleOptionChange(e, "version")}>
        <option value="" disabled>
          {t("side_nav.download_text.select_version")}
        </option>
        <option value="version1">Sample version</option>
      </select>
      <FiChevronDown size={16}/>
    </div>
  </div>

  const renderFormatDropdown = () => <div className="select-format">
    <label className="navbaritems">{t("side_nav.download_text.select_format")}</label>
    <div className="select-wrapper">
      <select
        className="navbaritems"
        value={downloadOptionSelections.format}
        onChange={(e) => handleOptionChange(e, "format")}>
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

  const renderDownloadTextOptions = () => {

    const renderTitle = () => {
      return <p className="download-text-title navbaritems">{t("side_nav.download_text")}</p>
    }
    const renderDownloadButton = () => <button className="download-button">{t("text.download")}</button>

    return <div className="download-options-container">
      {renderTitle()}
      {renderVersionsDropdown()}
      {renderFormatDropdown()}
      {renderDownloadButton()}
    </div>

  }

  return (
    <div className="texts-container">
      <div className="left-section">
        {renderTextTitleAndType()}
        {renderContinueReadingButton()}
        {renderTabsLocal()}
      </div>
      <div className="right-section">
        {/* {renderDownloadTextOptions()} */}
      </div>
    </div>
  )
}

export default Texts