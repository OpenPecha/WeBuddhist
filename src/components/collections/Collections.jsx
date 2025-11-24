import React from "react";
import "./Collections.scss";
import {useTranslate} from "@tolgee/react";
import axiosInstance from "../../config/axios-config.js";
import {LANGUAGE, siteName} from "../../utils/constants.js";
import {useQuery} from "react-query";
import {Link, useNavigate} from "react-router-dom";
import {getEarlyReturn, getLanguageClass, mapLanguageCode} from "../../utils/helperFunctions.jsx"; 
import Seo from "../commons/seo/Seo.jsx";
import PropTypes from "prop-types";
import {useCollectionColor} from "../../context/CollectionColorContext.jsx";

export const fetchCollections = async () => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "en");
  const {data} = await axiosInstance.get("/api/v1/collections", {
    params: {
      language,
      limit: 50,
      skip: 0
    }
  });
  return data;
}
const Collections = (props) => {
  const {showDescription = true,requiredInfo = {}, setRendererInfo} = props
  const navigate = useNavigate();
  const {t} = useTranslate();
  const {setCollectionColor} = useCollectionColor();
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

  const getColorFromIndex = (index) => {
    if (index % 9 === 0) return "#802F3E";
    if (index % 9 === 1) return "#5B99B7";
    if (index % 9 === 2) return "#5D956F";
    if (index % 9 === 3) return "#004E5F";
    if (index % 9 === 4) return "#594176";
    if (index % 9 === 5) return "#7F85A9";
    if (index % 9 === 6) return "#D4896C";
    if (index % 9 === 7) return "#C6A7B4";
    return "#CCB478";
  };

  const handleCollectionClick = (index) => {
    setCollectionColor(getColorFromIndex(index));
  };

  // ----------------------------- renderers -------------------------------------
  const renderBrowseLibrary = () => {
    return (
      <div className="browse-section">
        <h2 className="browse-library-text">{t("home.browse_text")}</h2>
      </div>
    );
  };

  const renderCollectionNames = (collection, index) => {
    if (requiredInfo.from === "compare-text" && !collection.has_child) {
      return (
        <Link 
          className= {`collection-link ${getLanguageClass(collection.language)}`} 
          onClick={() => {
            handleCollectionClick(index);
            setRendererInfo(prev => ({
              ...prev, 
              requiredId: collection.id,
              renderer: "works"
            }));
          }}
        >
          {collection.title}
        </Link>
      );
    }

    return collection.has_child ?
      <Link 
        to={`/collections/${collection.id}`} 
        className= {`collection-link ${getLanguageClass(collection.language)}`}
        onClick={() => handleCollectionClick(index)}
      >
        {collection.title}
      </Link> :
      <Link 
        to={`/works/${collection.id}`} 
        className= {`collection-link ${getLanguageClass(collection.language)}`}
        onClick={() => handleCollectionClick(index)}
      >
        {collection.title}
      </Link>
  }

  const renderCollections = () => {
    return (
      <div className="collections-list-container">
        {collectionsData?.collections.map((collection, index) => (
          <div className="collections" key={collection.id}>
            <div className={`${index % 9 === 0 ? "red-line" : index % 9 === 1 ? "green-line" : index % 9 === 2 ? "lightgreen-line" : index % 9 === 3 ? "blue-line" : index % 9 === 4 ? "purple-line" : index % 9 === 5 ? "lightpurpleline-line " : index % 9 === 6 ? "orangeline-line" : index % 9 === 7 ? "pink-line" : "gold-line"}`}/>
              {renderCollectionNames(collection, index)}
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
        <h2 className=" subtitle about-title">{t("side_nav.community.join_conversation")}</h2>
        <hr className="divider"/>
        <p className="content about-content">
          {t("side_nav.collection.description")}
        </p>
        <button className='explore-stories-btn navbaritems' onClick={() => navigate("/community")}>
         {t("side_nav.community.join_conversation")}
        </button>
      </div>
    );
  };


  return (
    <div className={`${!requiredInfo.from ? "collections-container" : "collections-container no-margin"}`}>
      <Seo
        title={`${siteName} - Buddhism in your own words`}
        description="Explore Buddhist texts, collections, and community discussions. Create notes, track your studies, and share insights."
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
