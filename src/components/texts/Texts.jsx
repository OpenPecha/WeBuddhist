import React, {useMemo, useState, useEffect} from 'react'
import {useQuery} from "react-query";
import {getLanguageClass, mapLanguageCode} from "../../utils/helperFunctions.jsx"; 
import Seo from "../commons/seo/Seo.jsx";
import "./Texts.scss"
import {LANGUAGE, siteName} from "../../utils/constants.js";
import axiosInstance from "../../config/axios-config.js";
import {useTranslate} from "@tolgee/react";
import {Link, useParams, useSearchParams} from "react-router-dom";
import {FiChevronDown} from "react-icons/fi";
import TableOfContents from "./table-of-contents/TableOfContents.jsx";
import Versions from "./versions/Versions.jsx";
import Commentaries from "./commentaries/Commentaries.jsx";
import PropTypes from "prop-types";

export const fetchTableOfContents = async (textId, skip, limit, languageFromContent = null) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const fallbackLanguage = (storedLanguage ? mapLanguageCode(storedLanguage) : "en");
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

export const fetchCommentaries = async (textId, skip, limit) => {
  const { data } = await axiosInstance.get(`/api/v1/texts/${textId}/commentaries`, {
    params: {
      skip,
      limit
    }
  });
  return { items: data };
}

const Texts = (props) => {
  const {requiredInfo = {}, setRendererInfo, collection_id, addChapter, currentChapter} = props;
  const { t } = useTranslate();
  const { id: urlId } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || "";
  const [activeTab, setActiveTab] = useState('contents');
  const [downloadOptionSelections, setDownloadOptionSelections] = useState({format: '', version: ''});
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const [versionsPagination, setVersionsPagination] = useState({ currentPage: 1, limit: 10 });
  const [commentariesPagination, setCommentariesPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination?.currentPage - 1) * pagination?.limit, [pagination]);
  const versionsSkip = useMemo(() => (versionsPagination?.currentPage - 1) * versionsPagination?.limit, [versionsPagination]);
  const commentariesSkip = useMemo(() => (commentariesPagination?.currentPage - 1) * commentariesPagination?.limit, [commentariesPagination]);
  
  const textId = requiredInfo?.from === "compare-text" ? collection_id : urlId;

  const {data: tableOfContents, isLoading: tableOfContentsIsLoading, error: tableOfContentsIsError} = useQuery(
    ["table-of-contents", textId, skip, pagination.limit],   
    () => fetchTableOfContents(textId, skip, pagination.limit),
    {refetchOnWindowFocus: false, enabled: !!textId, retry: false}
  );

  const {data: versions, isLoading: versionsIsLoading, error: versionsIsError} = useQuery(
    ["versions", textId, versionsSkip, versionsPagination.limit],   
    () => fetchVersions(textId, versionsSkip, versionsPagination.limit),
    {refetchOnWindowFocus: false, enabled: !!textId}
  );

  const {data: commentaries, isLoading: commentariesIsLoading, error: commentariesIsError} = useQuery(
    ["commentaries", textId, commentariesSkip, commentariesPagination.limit],
    () => fetchCommentaries(textId, commentariesSkip, commentariesPagination.limit),
    {refetchOnWindowFocus: false, enabled: !!textId, retry: false}
  );

  useEffect(() => {
    const hasMultipleSections = tableOfContents?.contents[0]?.sections?.length > 1;
    if (hasMultipleSections) {
      setActiveTab('contents');
    } else if (tableOfContents?.contents) {
      setActiveTab('versions');
    }
  }, [tableOfContents]);

  // -------------------------------------------- helpers ----------------------------------------------
  const handleOptionChange = (e, type) => { setDownloadOptionSelections(prev =>({...prev, [type]: e.target.value})) }
  const siteBaseUrl = window.location.origin;
  const canonicalUrl = `${siteBaseUrl}${window.location.pathname}`;
  const dynamicTitle = tableOfContents?.text_detail?.title ? `${tableOfContents.text_detail.title} | ${siteName}` : `Text | ${siteName}`;
  const description = "Read Buddhist texts with translations and related resources.";

  // --------------------------------------------- renderers -------------------------------------------
  const renderTextTitleAndType = () => {
    const renderTitle = () => {
      return <h1 className={`${getLanguageClass(tableOfContents?.text_detail.language)} overalltext`}>
        {tableOfContents?.text_detail.title}
      </h1>
    }

    const renderType = () => {
      return <div className="navbaritems">
        {t(`text.type.${type}`)}
      </div>
    }

    return(
      <div className="title-type-container">
        {renderTitle()}
        {/* {renderType()} */}
      </div>
    )
  }

  const renderContinueReadingButton = () => {
    return <Link className="navbaritems continue-reading-button"
                 to={`/chapter?text_id=${tableOfContents?.text_detail?.id}&contentId=${tableOfContents?.contents[0]?.id}&versionId=&contentIndex=${0}`}>
      {t("text.button.continue_reading")}
    </Link>

  }

  const renderTabs = () => {
    return <div className="tab-container listsubtitle">
      {/* Tab Navigation */}
      <div className="tab-nav">
        {
         tableOfContents?.contents[0]?.sections?.length > 1 && (
            <button
              className={`tab-button ${activeTab === 'contents' ? 'active' : ''}`}
              onClick={() => setActiveTab('contents')}
            >
              {t("text.contents")}
            </button>
          )
        }
        <button
          className={`tab-button ${activeTab === 'versions' ? 'active' : ''}`}
          onClick={() => setActiveTab('versions')}
        >
          {t("common.version")}
        </button>
        <button
          className={`tab-button ${activeTab === 'commentaries' ? 'active' : ''}`}
          onClick={() => setActiveTab('commentaries')}
        >
          {t("text.type.commentary")}
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'contents' && tableOfContents?.contents[0]?.sections?.length > 1 && (
          <div className="tab-panel">
            <TableOfContents tableOfContents={tableOfContents} pagination={pagination} setPagination={setPagination} textId={tableOfContents?.text_detail?.id} error={tableOfContentsIsError} loading={tableOfContentsIsLoading} t={t} requiredInfo={requiredInfo} addChapter={requiredInfo?.from === "compare-text" ? addChapter : undefined} currentChapter={requiredInfo?.from === "compare-text" ? currentChapter : undefined}/>
          </div>
        )}
        {activeTab === 'versions' && (
          <div className="tab-panel">
            <Versions 
              textId={textId} 
              requiredInfo={requiredInfo} 
              addChapter={requiredInfo?.from === "compare-text" ? addChapter : undefined} 
              currentChapter={requiredInfo?.from === "compare-text" ? currentChapter : undefined}
              versions={versions}
              versionsIsLoading={versionsIsLoading}
              versionsIsError={versionsIsError}
              versionsPagination={versionsPagination}
              setVersionsPagination={setVersionsPagination}
            />
          </div>
        )}
        {activeTab === 'commentaries' && (
          <div className="tab-panel">
            <Commentaries
              textId={textId}
              requiredInfo={requiredInfo}
              addChapter={requiredInfo?.from === "compare-text" ? addChapter : undefined}
              currentChapter={requiredInfo?.from === "compare-text" ? currentChapter : undefined}
              items={commentaries?.items || []}
              isLoading={commentariesIsLoading}
              isError={commentariesIsError}
              pagination={commentariesPagination}
              setPagination={setCommentariesPagination}
            />
          </div>
        )}
      </div>
    </div>
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


  return (
    <div className={`${!requiredInfo.from ? "texts-container" : "minified-texts-container"}`}>
      <Seo
        title={dynamicTitle}
        description={description}
        canonical={canonicalUrl}
      />
      <div className="left-section">
        {!requiredInfo.from && renderTextTitleAndType()}
        {!requiredInfo.from && renderContinueReadingButton()}
        {renderTabs()}
      </div>
      <div className="right-section">
        {/* {renderDownloadTextOptions()} */}
      </div>
    </div>
  )
}

export default Texts
Texts.propTypes = {
  requiredInfo: PropTypes.shape({
    from: PropTypes.string
  }),
  setRendererInfo: PropTypes.func,
  collection_id: PropTypes.string,
  addChapter: PropTypes.func,
  currentChapter: PropTypes.object
};
  