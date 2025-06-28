import React from "react";
import {Button} from "react-bootstrap";
import "./Collections.scss";
import {useTranslate} from "@tolgee/react";
import axiosInstance from "../../config/axios-config.js";
import {LANGUAGE} from "../../utils/constants.js";
import {useQuery} from "react-query";
import {Link} from "react-router-dom";
import {getEarlyReturn, mapLanguageCode} from "../../utils/helperFunctions.jsx";

export const fetchCollections = async () => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const {data} = await axiosInstance.get("api/v1/terms", {
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
    ["texts"],
    () => fetchCollections(),
    {refetchOnWindowFocus: false}
  );

  // ----------------------------- helpers ---------------------------------------

  const earlyReturn = getEarlyReturn({ termsIsLoading: collectionsIsLoading, collectionsError, t });
  if (earlyReturn) return earlyReturn;

  // ----------------------------- renderers -------------------------------------
  const renderBrowseLibrary = () => {
    return (
      <div className="browse-section">
        <h2 className="title browse-library-text">{t("home.browse_text")}</h2>
        <Button className="explore-collections-button">
          {t("side_nav.explore_collections")}
        </Button>
      </div>
    );
  };

  const renderCollections = () => {
    const renderCollectionNames = (term) => {
      return term.has_child ?
        <Link to={`/collections/${term.id}`} className="listtitle collection-link">
          {term.title}
        </Link> :
        term.title
    }
    return (
      <div className="collections-list-container">
        {collectionsData?.terms.map((term, index) => (
          <div className="collections">
            <div className={"red-line"}></div>
              {renderCollectionNames(term)}
              <p className="content collections-description">{term.description}</p>
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
