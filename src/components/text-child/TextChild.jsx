import React from 'react';
import { LANGUAGE, mapLanguageCode, getLanguageClass } from '../../utils/Constants';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axiosInstance from '../../config/axios-config';
import './TextChild.scss';
import { useTranslate } from '@tolgee/react';

export const fetchChildTexts = async (parentId) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const { data } = await axiosInstance.get("/api/v1/terms", {
    params: {
      language,
      ...(parentId && { parent_id: parentId }),
      limit: 10,
      skip: 0
    }
  });
  return data;
};

const TextChild = () => {
  const { id } = useParams();
  const { t } = useTranslate();
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const currentLanguage = storedLanguage ? mapLanguageCode(storedLanguage) : "bo";
  const { data: textChildData, isLoading } = useQuery(
    ["texts", id],
    () => fetchChildTexts(id),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20
    }
  );

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="main-container listtitle">
      <div className="text-child-container">
        <div className={`category-header ${getLanguageClass(currentLanguage)}`}>
          <h1>{textChildData?.parent?.title?.toUpperCase()}</h1>
        </div>
        <div className="text-sections">
          <div className="text-section">
            <div className="text-list ">
              {textChildData?.terms?.map((term) => (
                <Link key={term.id} to={`/texts/text-category/${term.id}`} className={`text-item overalltext ${getLanguageClass(currentLanguage)}`}>
                  <p>{term.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="sidebar">
        <h2 className={`about-title ${getLanguageClass(currentLanguage)}`}>{t('common.about')} {textChildData?.parent?.title}</h2>
        <div className="divider"></div>
      </div>
    </div>
  );
};

export default TextChild;