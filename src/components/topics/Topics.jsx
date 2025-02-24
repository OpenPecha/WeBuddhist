import {LANGUAGE, mapLanguageCode} from "../../utils/Constants.js";
import axiosInstance from "../../config/axios-config.js";
import {useQuery} from "react-query";
import {useEffect, useState} from "react";
import {useLocation, useNavigate, useParams, useSearchParams} from "react-router-dom";
import {Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import "./Topics.scss"
import React from "react";
import {useTranslate} from "@tolgee/react";

const fetchTopics = async (parentId) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language =(storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const { data } = await axiosInstance.get("api/v1/topics", {
    params: {
      language,
      ...(parentId && { parent_id: parentId }),
      limit: 12,
      skip: 0
    }
  });
  return data;
}

const Topics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate()
  const { t } = useTranslate();
  const [parentId, setParentId] = useState(searchParams.get("id") || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("");
  const translatedKey = t("topic.alphabet");
  const cleanAlphabetArray = translatedKey.split("").filter((char) => char.match(/[a-zA-Z.\u0F00-\u0FFF]/));
  const location = useLocation();

  const { data: topicsData, isLoading } = useQuery(
    ["topics", parentId],
    () => fetchTopics(parentId),
    { refetchOnWindowFocus: false}
  );

  const topicsList = topicsData || { topics: [], total: 0, skip: 0, limit: 12 };

  useEffect(()=>{
    setParentId(searchParams.get("id"))
  },[location])

  if(isLoading){
    return (
      <Container fluid className="topics-container">
        <Row className="topics-wrapper">
          <Col xs={12} className="text-center py-5">
            <p>Loading topics...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  function handleTopicClick(topic) {
    if(topic?.has_child){
      setSearchParams({ id: topic.id });
      setParentId(topic.id)
    }
  }
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedLetter("");
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    setSearchTerm("");
  };

  const renderTopicsList = () => {
    const filteredTopics = topicsList.topics.filter((topic) => {
      if (searchTerm) {
        return topic.title.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (selectedLetter) {
        return topic.title.startsWith(selectedLetter);
      }
      return true;
    });

    return (
      <Row xs={1} md={2} className="g-4">
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic, index) => (
            <Col key={index}>
              <Card className="topic-card">
                <button className="topic-button listtitle" onClick={() => handleTopicClick(topic)}>
                  {topic.title}
                </button>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <p>No topics found</p>
          </Col>
        )}
      </Row>
    );
  };

  const renderTopicsInfo = () => {
    return (
      <Card className="topic-info-card">
        <Card.Body>
          <h5>Topic Information</h5>
          <p>Details about the selected topic will be displayed here.</p>
        </Card.Body>
      </Card>
    );
  }

  const renderTopicTitle = () => {
    return <h4 className="topics-title listtitle">
      {parentId ? topicsData.parent?.title : t("topic.explore")}
    </h4>
  }
  const renderSearchBar = () => {
    return <div className="search-container">
      <Form.Control
        type="text"
        placeholder="Search topics..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="mb-3"
      />

      <div className="alphabet-filter">
        {cleanAlphabetArray.map((letter,index) => (
          <Button
            key={index}
            variant={selectedLetter === letter ? "secondary" : "outline-secondary"}
            className="alphabet-button listsubtitle"
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </Button>
        ))}
        <Button variant="outline-dark" className="clear-letter-click" onClick={() => setSelectedLetter("")}>
          {t("topic.clear")} {/*Todo : add clear in tolgee*/}
        </Button>
      </div>
    </div>
  }

  return (
    <Container fluid className="topics-container">
      <Row className="topics-wrapper">
        <Col xs={12} md={7} className="topics-list">
          {renderTopicTitle()}
          {renderSearchBar()}
          {renderTopicsList()}
        </Col>

        <Col xs={12} md={4} className="topic-info">
          {renderTopicsInfo()}
        </Col>
      </Row>
    </Container>
  );
};

export default React.memo(Topics);