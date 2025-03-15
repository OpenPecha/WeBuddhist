import React from 'react';
import axiosInstance from '../../config/axios-config';
import { LANGUAGE, mapLanguageCode } from "../../utils/Constants.js";
import './TextCategory.scss';
import { useTranslate } from '@tolgee/react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

const fetchTextCategory = async (categoryid, limit = 10, skip = 0) => {
    const storedLanguage = localStorage.getItem(LANGUAGE);
    const language = storedLanguage ? mapLanguageCode(storedLanguage) : "bo";
    const { data } = await axiosInstance.get("api/v1/texts", {
      params: {
        language,
        category:categoryid,
        limit:10,
        skip:0
      },
    });
    return data;
};

const TextCategory = () => {
  const categoryid= "1"
  const { t } = useTranslate();
  const { data: categoryTextData, isLoading } = useQuery(
    ["texts", categoryid],
    () => fetchTextCategory(categoryid),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20,

    }
  );
  console.log(categoryTextData)

  if (isLoading) {
    return <div className="notfound listtitle">Loading content...</div>;
  }

  if (!categoryTextData) {
    return <div className="notfound listtitle">
      <div className="no-content">No content found</div>
    </div>;
  }

  const textsByType = categoryTextData.texts.reduce((acc, text) => {
    if (!acc[text.type]) {
      acc[text.type] = [];
    }
    acc[text.type].push(text);
    return acc;
  }, {});

  const rootTexts = textsByType["root_text"] || [];
  const commentaryTexts = textsByType["commentary"] || [];

  return (
    <div className="main-container listtitle">
      <div className="text-category-container">
        <div className="category-header">
          <h1>{categoryTextData.category?.title}</h1>
        </div>
        <div className="text-sections">
          {rootTexts.length > 0 && (
            <div className="text-section">
              <h2 className="section-title">{t("text.type.root_text")}</h2>
              <div className="section-divider"></div>
              <div className="text-list">
                {rootTexts.map(text => (
                  <div key={text.id} className="text-item">
                    <p>{text.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {commentaryTexts.length > 0 && (
            <div className="text-section">
              <h2 className="section-title">{t("text.type.commentary")}</h2>
              <div className="section-divider"></div>
              <div className="text-list">
                {commentaryTexts.map(text => (
                  <div key={text.id} className="text-item">
                    <p>{text.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="sidebar" />
    </div>
  );
};

export default TextCategory;