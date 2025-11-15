import React from "react";
import "./Collections.scss";
import {useTranslate} from "@tolgee/react";
import axiosInstance from "../../config/axios-config.js";
import {LANGUAGE, siteName} from "../../utils/constants.js";
import {useQuery} from "react-query";
import {Link, useNavigate} from "react-router-dom";
import {getEarlyReturn, mapLanguageCode} from "../../utils/helperFunctions.jsx"; 
import Seo from "../commons/seo/Seo.jsx";
import PropTypes from "prop-types";

export const fetchCollections = async () => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "en");
  const {data} = await axiosInstance.get("/api/v1/collections", {
    params: {
      language,
      limit: 10,
      skip: 0
    }
  });
  return data;
}
const Collections = (props) => {
  const {showDescription = true,requiredInfo = {}, setRendererInfo} = props
  const navigate = useNavigate();
  const {t} = useTranslate();
  const {data: collectionsData, isLoading: collectionsIsLoading, error: collectionsError} = useQuery(
    ["collections"],
    () => fetchCollections(),
    {refetchOnWindowFocus: false}
  );

  // ----------------------------- helpers ---------------------------------------
  const siteBaseUrl =  window.location.origin;
  const canonicalUrl = `${siteBaseUrl}${window.location.pathname}`;
  const earlyReturn = getEarlyReturn({ isLoading: collectionsIsLoading, error: collectionsError, t });
  if (earlyReturn) return earlyReturn;

  // ----------------------------- renderers -------------------------------------
  const renderBrowseLibrary = () => {
    return (
      <div className="browse-section">
        <h2 className="browse-library-text">{t("home.browse_text")}</h2>
      </div>
    );
  };

  const renderCollectionNames = (collection) => {
    if (requiredInfo.from === "compare-text" && collection.has_child) {
      return (
        <button 
          className="title collection-link" 
          onClick={() => {
            setRendererInfo(prev => ({
              ...prev, 
              requiredId: collection.id,
              renderer: "sub-collections"
            }));
          }}
        >
          {collection.title}
        </button>
      );
    }

    return collection.has_child ?
      <Link to={`/collections/${collection.id}`} className="title collection-link">
        {collection.title}
      </Link> :
      <Link to={`/works/${collection.id}`} className="title collection-link">
        {collection.title}
      </Link>
  }

  const renderCollections = () => {
    return (
      <div className="collections-list-container">
        {collectionsData?.collections.map((collection, index) => (
          <div className="collections" key={collection.id}>
            <div className={`${index % 3 === 0 ? "red-line" : index % 3 === 1 ? "green-line" : "blue-line"}`}/>
              {renderCollectionNames(collection)}
              {showDescription && <p className="content collections-description">{collection.description}</p>}
          </div>
        ))}
      </div>
    );
  };

  const renderAboutSection = () => {
    return (
      <div className="right-section-content">
        <h2 className=" subtitle about-title">{t("side_nav.about_pecha_title")}</h2>
        <hr className="divider"/>
        <p className="content about-content">
          {t("side_nav.about_pecha_description")}
        </p>
        <h2 className=" subtitle about-title">Join the Conversation</h2>
        <hr className="divider"/>
        <p className="content about-content">
        People around the world use Webuddhist to create and share their Stories and Learning. You're invited to add your voice.
        </p>
        <button className='explore-stories-btn navbaritems' onClick={() => navigate("/community")}>
         Explore Stories
        </button>
      </div>
    );
  };


  return (
    <div className={`${!requiredInfo.from ? "collections-container" : "collections-container no-margin"}`}>
      <Seo
        title={`${siteName} - Tibetan Buddhism in your own words`}
        description="Explore Tibetan Buddhist texts, collections, and community discussions. Create notes, track your studies, and share insights."
        canonical={canonicalUrl}
      />
      <div className={`${!requiredInfo.from ? "left-section" : "minified-left-section"}`}>
        {!requiredInfo.from && renderBrowseLibrary()}
        {renderCollections()}
      </div>
      {!requiredInfo.from && <div className="right-section">
        {renderAboutSection()}

      </div>}
    </div>
  );
};

export default Collections;
Collections.propTypes = {
  showDescription: PropTypes.bool,
  requiredInfo: PropTypes.shape({
    from: PropTypes.string
  }),
  setRendererInfo: PropTypes.func
};
