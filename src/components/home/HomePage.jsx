import React, { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import "./HomePage.scss";
import { useTranslate } from "@tolgee/react";
import axiosInstance from "../../config/axios-config.js";
import { LANGUAGE, mapLanguageCode } from "../../utils/Constants.js";
import {useQuery} from "react-query";
import { useParams, Link } from "react-router-dom";

export const fetchTexts = async (parentId) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const { data } = await axiosInstance.get("api/v1/terms", {
    params: {
      language,
      ...(parentId && { parent_id: parentId }),
      limit: 10,
      skip: 0
    }
  });
  return data;
}
const HomePage = () => {
  const { id } = useParams();
  const { t } = useTranslate();
  const [parentId, setParentId] = useState(id || "");

  const { data: textData, isLoading } = useQuery(
    ["texts", parentId],
    () => fetchTexts(parentId),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20
    }
  );

  const textsList = textData || { terms: [], total: 0, skip: 0, limit: 10 };

  if (isLoading) {
    return (
      <Container fluid className="homepage-container">
        <Row className="justify-content-center">
          <Col xs={12} className="text-center py-5">
            <p>Loading content...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  const renderBrowseSection = () => {
    return (
      <div className="section-1 ">
        <h2 className="title mt-2  browse-library-text">{ t("home.browse_text") }</h2>
        <Button className="browse-button">
        { t("side_nav.explore_collections") }
        </Button>
      </div>
    );
  };

  const renderContentSection = () => {
    return (
      <div className="section-2 mt-5">
        <Row className="full-width-row flex-lg-row flex-column">
          {textsList.terms.slice(0, 2).map((term, index) => (
            <Col key={index} md={10} lg={6} className={`part ${index === 0 ? 'part-left' : 'part-right'}`}>
              <div className={`${index === 0 ? 'green-line' : 'red-line'} mb-3`} />
              <div className="listtitle part-title">
                {term.has_child ? (
                  <Link to={`/texts/text-child/${term.id}`} className="term-link">
                    {term.title}
                  </Link>
                ) : (
                  term.title
                )}
              </div>
              <p className="content part-subtitle">{term.description}</p>
            </Col>
          ))}
        </Row>
        <Row className="full-width-row flex-lg-row flex-column">
          {textsList.terms.slice(2, 3).map((term, index) => (
            <Col key={index} md={10} lg={6} className="part  part-left ">
              <div className="red-line  mb-3"/>
              <div className="listtitle part-title">
                {term.has_child ? (
                  <Link to={`/texts/text-child/${term.id}`}  className="term-link">
                    {term.title}
                  </Link>
                ) : (
                  term.title
                )}
              </div>              <p className="content part-subtitle">{term.description}</p>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const renderAboutSection = () => {
    return (
      <>
        <h2 className="title right-title">{ t("side_nav.about_pecha_title") }</h2>
        <hr className="right-divider"/>
        <p className=" content right-paragraph">
          { t("side_nav.about_pecha_description") }
          <span className=" learn-more"> { t("common.learn_more") }</span>
        </p>
      </>
    );
  };

  return (
    <Container fluid className="homepage-container">
      <Row className="justify-content-center">
        <Col lg={7} md={8} className="left-section mb-4 mb-lg-0">
          {renderBrowseSection()}
          {renderContentSection()}
        </Col>
        <Col lg={5} md={4} className="right-section d-flex flex-column">
          {renderAboutSection()}
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
