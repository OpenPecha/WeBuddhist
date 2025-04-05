import React from 'react';
import axiosInstance from '../../config/axios-config';
import { LANGUAGE, mapLanguageCode, getLanguageClass } from "../../utils/Constants.js";
import './Book.scss';
import { useTranslate } from '@tolgee/react';
import { useQuery } from 'react-query';
import { useParams,Link } from 'react-router-dom';

const fetchTextCategory = async (bookId, limit = 10, skip = 0) => {
  try {
    const storedLanguage = localStorage.getItem(LANGUAGE);
    const language = storedLanguage ? mapLanguageCode(storedLanguage) : "bo";
    
    const { data } = await axiosInstance.get("/api/v1/texts", {
      params: {
        language,
        term_id: bookId,
        limit,
        skip
      }
    });
    return data;
  } catch (error) {
    console.error("API call error:", error.response || error);
    throw error;
  }
};

const Book = () => {
  const { id } = useParams();
  const { t } = useTranslate();
  
  const { data: categoryTextData, isLoading, error } = useQuery(
    ["book", id],
    () => fetchTextCategory(id),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20,
      retry: 1,
      onError: (err) => console.error("Query error:", err)
    }
  );
  
  
  if (isLoading) {
    return <div className="notfound listtitle">Loading content...</div>;
  }
  
  if (error) {
    return <div className="notfound listtitle">
      <div className="no-content">Error loading content: {error.message}</div>
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
          <h1 className="overalltext">{categoryTextData.term?.title}</h1>
        </div>
        <div className="text-sections">
          {(!categoryTextData.texts || categoryTextData.texts.length === 0) ? (
            <div className="text-section">
              <div className="no-content">No text found</div>
            </div>
          ) : (
            <>
              {rootTexts.length > 0 && (
                <div className="text-section">
                  <h2 className="section-title overalltext">{t("text.type.root_text")}</h2>
                  <div className="section-divider"></div>
                  <div className="text-list">
                    {rootTexts.map((text,i) => (
                      <div key={i} className="text-item ">
                        <Link to={`/text-detail/${text.id}`} className={`text-link ${getLanguageClass(text.language)}`} state={{ titleInformation: text }}>
                        <p>{text.title}</p>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {commentaryTexts.length > 0 && (
                <div className="text-section">
                  <h2 className="section-title overalltext">{t("text.type.commentary")}</h2>
                  <div className="section-divider"></div>
                  <div className="text-list">
                    {commentaryTexts.map((text,i) => (
                      <div key={i} className="text-item">
                       <Link to={`/text-detail/${text.id}`} className={`text-link ${getLanguageClass(text.language)}`}  state={{ titleInformation: text }} >
                        <p>{text.title}</p>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="sidebar" />
    </div>
  );
};

export default Book;