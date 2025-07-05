import React, {useMemo} from 'react';
import axiosInstance from '../../config/axios-config';
import { LANGUAGE } from "../../utils/constants.js";
import './Works.scss';
import { useTranslate } from '@tolgee/react';
import { useQuery } from 'react-query';
import { useParams,Link } from 'react-router-dom';
import {getEarlyReturn, getLanguageClass, mapLanguageCode} from "../../utils/helperFunctions.jsx";

const fetchWorks = async (bookId, limit = 10, skip = 0) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "bo";

  const {data} = await axiosInstance.get("/api/v1/texts", {
    params: {
      language,
      term_id: bookId,
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


const Works = () => {
  const {id} = useParams();
  const {t} = useTranslate();

  const {data: worksData, isLoading: worksDataIsLoading, error: worksDataIsError} = useQuery(
    ["works", id],
    () => fetchWorks(id),
    {refetchOnWindowFocus: false}
  );

  // ---------------------------------- helpers ----------------------------------

  const texts = worksData?.texts || [];
  const groupedTexts = useGroupedTexts(texts);

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
    return (
      <div className="root-text-section">
        {renderTitle()}
        {rootTexts.length === 0 ? (
          <div className="no-content">{t("text.root_text_not_found")}</div>
        ) : (
          <div className="root-text-list">
            {rootTexts.map((text) => (
              <Link key={text.id} to={`/texts/${text.id}`}
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
    return (
      <div className="commentary-section">
        {renderTitle()}
        {commentaryTexts.length === 0 ? (
          <div className="no-content">{t("text.commentary_text_not_found")}</div>
        ) : (
          <div className="commentary-list">
            {commentaryTexts.map((text) => (
              <Link key={text.id} to={`/texts/${text.id}`}
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