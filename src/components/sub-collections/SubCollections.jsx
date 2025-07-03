import React from 'react';
import { LANGUAGE } from '../../utils/constants.js';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axiosInstance from '../../config/axios-config';
import './SubCollections.scss';
import { useTranslate } from '@tolgee/react';
import {getEarlyReturn, mapLanguageCode} from "../../utils/helperFunctions.jsx";

export const fetchSubCollections = async (parentId) => {
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

const SubCollections = () => {
  const {id} = useParams();
  const {t} = useTranslate();
  const {data: subCollectionsData, isLoading: subCollectionsDataIsLoading, error: subCollectionsError} = useQuery(
    ["texts", id],
    () => fetchSubCollections(id),
    {refetchOnWindowFocus: false}
  );

  if (subCollectionsDataIsLoading) {
    return <div className="loading listtitle">{t("common.loading")}</div>;
  }
  // ----------------------------------- helpers -----------------------------------------

  const earlyReturn = getEarlyReturn({ termsIsLoading: subCollectionsDataIsLoading, subCollectionsError, t });
  if (earlyReturn) return earlyReturn;

  // ----------------------------------- renderers ---------------------------------------
  const renderTitle = () =>  <h1>{subCollectionsData?.parent?.title?.toUpperCase()}</h1>

  const renderSubCollections = () => {

    return <div className="sub-collections-list-container">
      {subCollectionsData?.terms?.map((term) =>
        <Link key={term.id} to={`/works/${term.id}`} className="text-item overalltext sub-collection">
          <div className="divider"></div>
          <p>{term.title}</p>
        </Link>
      )}
    </div>
  }

  const renderAboutSection = () => {
    const subCollectionTitle = subCollectionsData?.parent?.title

    return <div className="about-content">
      <h1 className="about-title">{t('common.about')} {subCollectionTitle}</h1>
      <div className="divider"></div>
    </div>
  }

  return (
    <div className="sub-collections-container">
      <div className="sub-collection-details">
        {renderTitle()}
        {renderSubCollections()}
      </div>
      <div className="about-section">
        {renderAboutSection()}
      </div>
    </div>

  )
};

export default SubCollections;