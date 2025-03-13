import React from 'react';
import axiosInstance from '../../config/axios-config';
import { LANGUAGE, mapLanguageCode } from "../../utils/Constants.js";
import './TextCategory.scss';
import { useTranslate } from '@tolgee/react';

const fetchTextCategory = async (categoryId, limit, skip) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "bo";
  const { data } = await axiosInstance.get("api/v1/texts", {
    params: {
      language,
      category_id: categoryId,
      limit,
      skip
    },
  });
  return data;
};

const dummyData = [
  {
    "category": {
      "id": "d19338e",
      "title": "THE HEART SUTRA",
      "description": "Heart Sutra title",
      "slug": "heart-sutra",
      "has_child": false
    },
    "texts": [
      {
        "id": "uuid-root-1",
        "title": "The Heart of the Perfection of Wisdom",
        "language": "en",
        "type": "root_text",
        "is_published": true,
        "created_date": "2021-09-01T00:00:00.000Z",
        "updated_date": "2021-09-01T00:00:00.000Z",
        "published_date": "2021-09-01T00:00:00.000Z",
        "published_by": "buddhist_tab"
      },
      {
        "id": "uuid-commentary-1",
        "title": "Chakna Dorje, Explaining the Heart Sutra",
        "language": "en",
        "type": "commentary",
        "is_published": true,
        "created_date": "2021-09-01T00:00:00.000Z",
        "updated_date": "2021-09-01T00:00:00.000Z",
        "published_date": "2021-09-01T00:00:00.000Z",
        "published_by": "buddhist_tab"
      },
      {
        "id": "uuid-commentary-2",
        "title": "Taranatha, Word for Word Commentary on the Heart Sutra",
        "language": "en",
        "type": "commentary",
        "is_published": true,
        "created_date": "2021-09-01T00:00:00.000Z",
        "updated_date": "2021-09-01T00:00:00.000Z",
        "published_date": "2021-09-01T00:00:00.000Z",
        "published_by": "buddhist_tab"
      },
      {
        "id": "uuid-commentary-3",
        "title": "Vairocana, Unravelling the Meaning of the Heart of Sutra According to the Mantra",
        "language": "en",
        "type": "commentary",
        "is_published": true,
        "created_date": "2021-09-01T00:00:00.000Z",
        "updated_date": "2021-09-01T00:00:00.000Z",
        "published_date": "2021-09-01T00:00:00.000Z",
        "published_by": "buddhist_tab"
      }
    ],
    "total": 4,
    "skip": 0,
    "limit": 10
  }
];

const TextCategory = () => {
  const textsByType = dummyData[0].texts.reduce((acc, text) => {
    if (!acc[text.type]) {
      acc[text.type] = [];
    }
    acc[text.type].push(text);
    return acc;
  }, {});

  console.log(textsByType)
  const rootTexts = textsByType["root_text"] || [];
  const commentaryTexts = textsByType["commentary"] || [];

  const {t}=useTranslate()
  return (
    <div className="main-container listtitle">
      <div className="text-category-container">
        <div className="category-header ">
          <h1>{dummyData[0].category.title}</h1>
        </div>
        <div className="text-sections">
          {rootTexts.length > 0 && (
            <div className="text-section">
              <h2 className="section-title">{t("text.type.root_text")}</h2>
              <div className="section-divider"></div>
              <div className="text-list ">
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
              <div className="text-list ">
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
      <div className="sidebar"/>
       
      
    </div>
  );
};

export default TextCategory;