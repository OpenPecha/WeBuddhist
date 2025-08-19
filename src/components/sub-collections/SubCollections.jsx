import React from 'react';
import { LANGUAGE, siteName } from '../../utils/constants.js';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axiosInstance from '../../config/axios-config';
import './SubCollections.scss';
import { useTranslate } from '@tolgee/react';
import {getEarlyReturn, mapLanguageCode} from "../../utils/helperFunctions.jsx"; 
import Seo from "../commons/seo/Seo.jsx";

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

const SubCollections = (props) => {
  const { from, parent_id, setRenderer, setRequiredId } = props;
  const {id} = useParams();
  const {t} = useTranslate();
  
  const collectionId = parent_id || id;
  
  const {data: subCollectionsData, isLoading: subCollectionsDataIsLoading, error: subCollectionsError} = useQuery(
    ["sub-collections", collectionId],
    () => fetchSubCollections(collectionId),
    {refetchOnWindowFocus: false}
  );
  const siteBaseUrl = window.location.origin;
  const canonicalUrl = `${siteBaseUrl}${window.location.pathname}`;
  const pageTitle = subCollectionsData?.parent?.title ? `${subCollectionsData.parent.title} | ${siteName}` : `Collection | ${siteName}`;

  // ----------------------------------- helpers -----------------------------------------
  const earlyReturn = getEarlyReturn({ isLoading: subCollectionsDataIsLoading, error: subCollectionsError, t });
  if (earlyReturn) return earlyReturn;

  // ----------------------------------- renderers ---------------------------------------
  const renderTitle = () =>  <h1 className="listtitle">{subCollectionsData?.parent?.title?.toUpperCase()}</h1>

  const renderSubCollections = () => {
    const containerClass = from === "compare-text" ? "minified-left-section" : "sub-collections-list-container";
    
    return (
      <div className={containerClass}>
        {subCollectionsData?.collections?.map((collection) => {
          if (from === "compare-text") {
            return (
              <div 
                key={collection.id} 
                className="text-item overalltext sub-collection"
                onClick={() => {
                  console.log ("root and commentary here")
                }}
              >
                <div className="divider"></div>
                <p>{collection.title}</p>
              </div>
            );
          }
          
          return (
            <Link key={collection.id} to={`/works/${collection.id}`} className="text-item overalltext sub-collection">
              <div className="divider"></div>
              <p>{collection.title}</p>
            </Link>
          );
        })}
      </div>
    );
  }

  const renderAboutSection = () => {
    if (from === "compare-text") return null;
    
    const subCollectionTitle = subCollectionsData?.parent?.title;

    return (
      <div className="about-content">
        <h1 className="listsubtitle about-title">{t('common.about')} {subCollectionTitle}</h1>
        <div className="divider"></div>
      </div>
    );
  }

  return (
    <div className={`sub-collections-container ${from === "compare-text" ? "compare-text-view" : ""}`}>
      {!from && (
        <Seo
          title={pageTitle}
          description="Explore sub-collections and navigate to works."
          canonical={canonicalUrl}
        />
      )}
      <div className={`sub-collection-details ${from === "compare-text" ? "full-width" : ""}`}>
        {!from && renderTitle()}
        {renderSubCollections()}
      </div>
      {renderAboutSection() && (
        <div className="about-section">
          {renderAboutSection()}
        </div>
      )}
    </div>
  );
};

export default SubCollections;