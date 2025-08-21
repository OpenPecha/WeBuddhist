import React, {useMemo} from 'react';
import axiosInstance from '../../config/axios-config';
import { LANGUAGE, siteName } from "../../utils/constants.js";
import './Works.scss';
import { useTranslate } from '@tolgee/react';
import { useQuery } from 'react-query';
import { useParams,Link } from 'react-router-dom';
import {getEarlyReturn, getLanguageClass, mapLanguageCode} from "../../utils/helperFunctions.jsx";
import Seo from "../commons/seo/Seo.jsx";

const fetchWorks = async (bookId, limit = 10, skip = 0) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "bo";

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
  const {requiredInfo = {}, setRequiredInfo, setRequiredId, setRenderer} = props

  const id = requiredInfo.from === "compare-text" ? props.collection_id : paramId;

  const {data: worksData, isLoading: worksDataIsLoading, error: worksDataIsError} = useQuery(
    ["works", id],
    () => fetchWorks(id),
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


  const rootTexts = groupedTexts["root_text"] || [];
  const commentaryTexts = groupedTexts["commentary"] || [];

  // ---------------------------------- renderers ---------------------------------
  const renderWorksTitle = () => {

    return <h1 className="overalltext">{worksData.term?.title}</h1>
  }
  const renderRootTexts = () => {
    const renderTitle = () => <h2 className="section-title overalltext">{t("text.type.root_text")}</h2>;
    if (requiredInfo.from === "compare-text") {
      return (
        <div className="root-text-section">
          {renderTitle()}
          {rootTexts.length === 0 ? (
            <div className="no-content">{t("text.root_text_not_found")}</div>
          ) : (
            <div className={requiredInfo.from === "compare-text" ? "minified-root-text-list" : "root-text-list"}>
              {rootTexts.map((text) => (
                <div 
                  key={text.id} 
                  className={`${getLanguageClass(text.language)} text-item overalltext root-text`}
                  onClick={() => {
                    setRequiredId(text.id);
                    setRenderer("texts");
                  }}
                >
                <div className="divider"></div>
                  <p>{text.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    return (
      <div className="root-text-section">
        {renderTitle()}
        {rootTexts.length === 0 ? (
          <div className="no-content">{t("text.root_text_not_found")}</div>
        ) : (
          <div className="root-text-list">
            {rootTexts.map((text) => (
              <Link key={text.id} to={`/texts/${text.id}?type=root_text`}
                    className={`${getLanguageClass(text.language)} root-text`}>
                <div className="divider"></div>
                <p>{text.title}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const renderCommentaryTexts = () => {
    const renderTitle = () => <h2 className="section-title overalltext">{t("text.type.commentary")}</h2>;
    if (requiredInfo.from === "compare-text") {
      return (
        <div className="commentary-section">
          {renderTitle()}
          {commentaryTexts.length === 0 ? (
            <div className="no-content">{t("text.commentary_text_not_found")}</div>
          ) : (
            <div className={requiredInfo.from === "compare-text" ? "minified-commentary-list" : "commentary-list"}>
              {commentaryTexts.map((text) => (
                <div 
                  key={text.id} 
                  className={`${getLanguageClass(text.language)} text-item overalltext commentary-text`}
                  onClick={() => {
                    setRequiredId(text.id);
                    setRenderer("texts");
                  }}
                >
                  <div className="divider"></div>
                  <p>{text.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    return (
      <div className="commentary-section">
        {renderTitle()}
        {commentaryTexts.length === 0 ? (
          <div className="no-content">{t("text.commentary_text_not_found")}</div>
        ) : (
          <div className="commentary-list">
            {commentaryTexts.map((text) => (
              <Link key={text.id} to={`/texts/${text.id}?type=commentary`}
                    className={`${getLanguageClass(text.language)} commentary-text`}>
                <div className="divider"></div>
                <p>{text.title}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="works-container">
      <Seo
        title={pageTitle}
        description="Browse texts grouped by type within this collection."
        canonical={canonicalUrl}
      />
      <div className="left-section">
        <div className="works-title-container">{renderWorksTitle()}</div>
        <div className="root-text-container">{renderRootTexts()}</div>
        <div className="commentary-text-container">{renderCommentaryTexts()}</div>
      </div>
      <div className="right-section">
        <div className="sidebar" />
      </div>
    </div>
  )

};

export default Works;