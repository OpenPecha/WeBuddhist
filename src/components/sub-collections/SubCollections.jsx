import React from 'react';
import { LANGUAGE } from '../../utils/constants.js';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axiosInstance from '../../config/axios-config';
import './SubCollections.scss';
import { useTranslate } from '@tolgee/react';
import {getEarlyReturn, mapLanguageCode} from "../../utils/helperFunctions.jsx"; 
import {useDynamicTabTitle} from "../../utils/dynamicTitle.jsx";

export const fetchSubCollections = async (parentId) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const { data } = await axiosInstance.get("/api/v1/collections", {
    params: {
      language,
      ...(parentId && { parent_id: parentId }),
      limit: 10,
      skip: 0
    }
  });
  return data;
};

export const renderSubCollections = (subCollectionsData, {useButtons = false, setSelectedTerm = null}) => {

  if (!subCollectionsData?.collections) {
    return null;
  }

  return <div className="sub-collections-list-container">
    {subCollectionsData.collections.map((collection) =>
      useButtons ? (
        <button key={collection.id} type="button" onClick={() => { if(setSelectedTerm) {setSelectedTerm(collection)}}}>
          {collection.title}
        </button>
      ) : (
        <Link key={collection.id} to={`/works/${collection.id}`} className="text-item overalltext sub-collection">
          <div className="divider"></div>
          <p>{collection.title}</p>
        </Link>
      )
    )}
  </div>
}

const SubCollections = () => {
  const {id} = useParams();
  const {t} = useTranslate();
  const {data: subCollectionsData, isLoading: subCollectionsDataIsLoading, error: subCollectionsError} = useQuery(
    ["sub-collections", id],
    () => fetchSubCollections(id),
    {refetchOnWindowFocus: false}
  );
  useDynamicTabTitle(subCollectionsData?.parent?.title);

  if (subCollectionsDataIsLoading) {
    return <div className="loading listtitle">{t("common.loading")}</div>;
  }
  // ----------------------------------- helpers -----------------------------------------
  const earlyReturn = getEarlyReturn({ isLoading: subCollectionsDataIsLoading, error: subCollectionsError, t });
  if (earlyReturn) return earlyReturn;

  // ----------------------------------- renderers ---------------------------------------
  const renderTitle = () =>  <h1 className="listtitle">{subCollectionsData?.parent?.title?.toUpperCase()}</h1>

  const renderAboutSection = () => {
    const subCollectionTitle = subCollectionsData?.parent?.title

    return <div className="about-content">
      <h1 className="listsubtitle about-title">{t('common.about')} {subCollectionTitle}</h1>
      <div className="divider"></div>
    </div>
  }

  return (
    <div className="sub-collections-container">
      <div className="sub-collection-details">
        {renderTitle()}
        {renderSubCollections(subCollectionsData, {})}
      </div>
      <div className="about-section">
        {renderAboutSection()}
      </div>
    </div>

  )
};

export default SubCollections;