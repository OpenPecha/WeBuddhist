import React, {useMemo, useState} from 'react';
import axiosInstance from '../../config/axios-config';
import { LANGUAGE, siteName } from "../../utils/constants.js";
import './Works.scss';
import { useTolgee, useTranslate } from '@tolgee/react';
import { useQuery, useQueryClient } from 'react-query';
import { useParams,Link } from 'react-router-dom';
import {getEarlyReturn, getLanguageClass, mapLanguageCode} from "../../utils/helperFunctions.jsx";
import Seo from "../commons/seo/Seo.jsx";
import PropTypes from "prop-types";
import PaginationComponent from "../commons/pagination/PaginationComponent.jsx";
import { changeLanguage } from '../navbar/NavigationBar.jsx';
import pechaIcon from "../../assets/icons/pecha_icon.png";
const fetchWorks = async (bookId, limit = 10, skip = 0) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "en";

  const {data} = await axiosInstance.get("/api/v1/texts", {
    params: {
      language,
      collection_id: bookId,
      limit,
      skip
    }
  });
  return data;
};

const useGroupedTexts = (texts = []) => {
  return useMemo(() => {
    const textTypes = {};
    for (const item of texts) {
      const type = item.type;
      if (!textTypes[type]) textTypes[type] = [];
      textTypes[type].push(item);
    }
    return textTypes;
  }, [texts]);
};


const Works = (props) => {
  const {id: paramId} = useParams();
  const {t} = useTranslate();
  const {requiredInfo = {}, setRendererInfo} = props
  const queryClient = useQueryClient();
  const tolgee = useTolgee(['language']);
  const id = requiredInfo.from === "compare-text" ? props.collection_id : paramId;
  const isCompareText = requiredInfo.from === "compare-text";

  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);

  const {data: worksData, isLoading: worksDataIsLoading, error: worksDataIsError} = useQuery(
    ["works", id, skip, pagination.limit],
    () => fetchWorks(id, pagination.limit, skip),
    {refetchOnWindowFocus: false}
  );

  // ---------------------------------- helpers ----------------------------------

  const texts = worksData?.texts || [];
  const groupedTexts = useGroupedTexts(texts);

  const siteBaseUrl = window.location.origin;
  const canonicalUrl = `${siteBaseUrl}${window.location.pathname}`;
  const pageTitle = worksData?.collection?.title ? `${worksData.collection.title} | ${siteName}` : `Works | ${siteName}`;
  const earlyReturn = getEarlyReturn({ isLoading: worksDataIsLoading, error: worksDataIsError, t });
  if (earlyReturn) return earlyReturn;

  const totalPages = Math.ceil((worksData?.total || 0) / pagination.limit);
  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, currentPage: pageNumber }));
  };

  const rootTexts = groupedTexts["root_text"] || [];
  const commentaryTexts = groupedTexts["commentary"] || [];

  // ---------------------------------- renderers ---------------------------------
  const renderWorksTitle = () => {

    return <h1 className="overalltext">{worksData.term?.title}</h1>
  }

  const renderRootTextItem = (text) => isCompareText ? (
    <button 
      key={text.id} 
      className={`${getLanguageClass(text.language)} text-item root-text`}
      onClick={() => {
        setRendererInfo(prev => ({
          ...prev,
          requiredId: text.id,
          renderer: "texts"
        }));
      }}
    >
      <div className="divider"></div>
      <p>{text.title}</p>
    </button>
  ) : (
    <Link key={text.id} to={`/texts/${text.id}?type=root_text`}
          className={`${getLanguageClass(text.language)} root-text`}>
      <div className="divider"></div>
      <p>{text.title}</p>
    </Link>
  )

  const renderRootTexts = () => {
    const renderTitle = () => <h1 className="title">{worksData?.collection?.title}</h1>;
  
    return (
      <div className="root-text-section">
        {rootTexts.length !== 0 && (
          <>
          {renderTitle()}
          <div className={isCompareText ? "minified-root-text-list" : "root-text-list"}>
            {rootTexts.map((text) => 
              renderRootTextItem(text)
            )}
          </div>
          </>
        )}
      </div>
    );
  }

  const renderCommentaryTextItem = (text) => isCompareText ? (
    <button 
      key={text.id} 
      className={`${getLanguageClass(text.language)} text-item commentary-text`}
      onClick={() => {
        setRendererInfo(prev => ({
          ...prev,
          requiredId: text.id,
          renderer: "texts"
        }));
      }}
    >
      <div className="divider"></div>
      <p>{text.title}</p>
    </button>
  ) : (
    <Link key={text.id} to={`/texts/${text.id}?type=commentary`}
          className={`${getLanguageClass(text.language)} commentary-text`}>
      <div className="divider"></div>
      <p>{text.title}</p>
    </Link>
  )

  const renderCommentaryTexts = () => {
    const renderTitle = () => <h2 className="section-title overalltext">{t("text.type.commentary")}</h2>;
    return (
      <div className="commentary-section">
        {commentaryTexts.length !== 0 && (
          <>
          {renderTitle()}
          <div className={isCompareText ? "minified-commentary-list" : "commentary-list"}>
            {commentaryTexts.map((text) => 
              renderCommentaryTextItem(text)
            )}
          </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={`${
        !requiredInfo.from ? "works-container" : "works-container no-margin"
      }`}
    >
      <Seo
        title={pageTitle}
        description="Browse texts grouped by type within this collection."
        canonical={canonicalUrl}
      />
      <div
        className={`${
          !requiredInfo.from ? "left-section" : "minified-left-section"
        }`}
      >
        <div className="works-title-container">{renderWorksTitle()}</div>
        {texts.length == 0 && (
          <div className="no-content-container">
            <img src={pechaIcon} alt="pecha icon" width={80} height={80} />
            <div className="no-content">{t("work.no_text.change")}</div>
            <button
              className="no-language-alert"
              onClick={() => changeLanguage("bo-IN", queryClient, tolgee)}
            >
              {t("work.no_text.button")}
            </button>
          </div>
        )}
        <div className="root-text-container">{renderRootTexts()}</div>
        <div className="commentary-text-container">
          {renderCommentaryTexts()}
        </div>
        {texts.length > 10 && (
          <PaginationComponent
            pagination={pagination}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            setPagination={setPagination}
          />
        )}
      </div>
    </div>
  );

};

export default Works;
Works.propTypes = {
  collection_id: PropTypes.string,
  requiredInfo: PropTypes.shape({
    from: PropTypes.string
  }),
  setRendererInfo: PropTypes.func
};