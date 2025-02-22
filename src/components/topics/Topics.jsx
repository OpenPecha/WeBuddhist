import {LANGUAGE, mapLanguageCode} from "../../utils/Constants.js";
import axiosInstance from "../../config/axios-config.js";
import {useQuery} from "react-query";
import { useState, useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import "./Topics.scss"
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
  const {id} = useParams()
  const navigate = useNavigate()
  const { t } = useTranslate();
  const [parentId, setParentId] = useState(id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState(localStorage.getItem(LANGUAGE));
  const translatedKey = t("topic.alphabet");
  const cleanAlphabetArray = translatedKey
    .split("")
    .filter((char) => char.match(/[a-zA-Z.\u0F00-\u0FFF]/));

  const { data: topicsData, isLoading, isFetching } = useQuery(
    ["topics", parentId, currentLanguage],
    () => fetchTopics(parentId),
    { refetchOnWindowFocus: false,refetchOnMount: true }
  );

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === LANGUAGE) {
        setCurrentLanguage(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const intervalId = setInterval(() => {
      const storedLanguage = localStorage.getItem(LANGUAGE);
      if (storedLanguage !== currentLanguage) {
        setCurrentLanguage(storedLanguage);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [currentLanguage]);

  if(isLoading || isFetching){
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
  const topicsList = topicsData || { topics: [], total: 0, skip: 0, limit: 12 };

  function handleTopicClick(topic) {
    setParentId(topic.title)
    topic?.parent_id && navigate(`/topics/${topic.title}`)
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
      {parentId && id ? t(`topic.${parentId}`) : t("topic.search_topics")}
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
          clear
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

export default Topics;