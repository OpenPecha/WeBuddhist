import React from "react";
import "./Collections.scss";
import {useTranslate} from "@tolgee/react";
import axiosInstance from "../../config/axios-config.js";
import {LANGUAGE} from "../../utils/constants.js";
import {useQuery} from "react-query";
import {Link} from "react-router-dom";
import {getEarlyReturn, mapLanguageCode} from "../../utils/helperFunctions.jsx"; 
import Seo from "../commons/seo/Seo.jsx";

export const fetchCollections = async () => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const {data} = await axiosInstance.get("api/v1/collections", {
    params: {
      language,
      limit: 10,
      skip: 0
    }
  });
  return data;
}
const Collections = () => {
  const {t} = useTranslate();
  const {data: collectionsData, isLoading: collectionsIsLoading, error: collectionsError} = useQuery(
    ["collections"],
    () => fetchCollections(),
    {refetchOnWindowFocus: false}
  );

  // ----------------------------- helpers ---------------------------------------
  const siteName = "Webuddhist";
  const siteBaseUrl =  window.location.origin;
  const canonicalUrl = `${siteBaseUrl}${window.location.pathname}`;
  const earlyReturn = getEarlyReturn({ isLoading: collectionsIsLoading, error: collectionsError, t });
  if (earlyReturn) return earlyReturn;

  // ----------------------------- renderers -------------------------------------
  const renderBrowseLibrary = () => {
    return (
      <div className="browse-section">
        <h2 className="title browse-library-text">{t("home.browse_text")}</h2>
        <button className="listtitle explore-collections-button">
          {t("side_nav.explore_collections")}
        </button>
      </div>
    );
  };

  const renderCollections = () => {
    const renderCollectionNames = (collection) => {
      return collection.has_child ?
        <Link to={`/collections/${collection.id}`} className="listtitle collection-link">
          {collection.title}
        </Link> :
        collection.title
    }
    return (
      <div className="collections-list-container">
        {collectionsData?.collections.map((collection, index) => (
          <div className="collections" key={collection.id}>
            <div className={"red-line"}></div>
              {renderCollectionNames(collection)}
              <p className="content collections-description">{collection.description}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderAboutSection = () => {
    return (
      <div className="right-section-content">
        <h2 className="title about-title">{t("side_nav.about_pecha_title")}</h2>
        <hr className="divider"/>
        <p className="content about-content">
          {t("side_nav.about_pecha_description")}
          <span className="learn-more"> {t("common.learn_more")}</span>
        </p>
      </div>
    );
  };


  return (
    <div className="collections-container">
      <Seo
        title={`${siteName} - Tibetan Buddhism in your own words`}
        description="Explore Tibetan Buddhist texts, collections, and community discussions. Create notes, track your studies, and share insights."
        canonical={canonicalUrl}
      />
      <div className="left-section">
        {renderBrowseLibrary()}
        {renderCollections()}
      </div>
      <div className="right-section">
        {renderAboutSection()}
      </div>
    </div>
  );
};

export default Collections;
