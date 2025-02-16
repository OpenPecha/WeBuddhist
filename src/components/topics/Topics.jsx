import {LANGUAGE} from "../../utils/Constants.js";
import axiosInstance from "../../config/axios-config.js";
import {useQuery} from "react-query";
import { useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import "./Topics.scss"
import {useTranslate} from "@tolgee/react";

const fetchTopics = async (parentId) => {
  const language = localStorage.getItem(LANGUAGE) ??  "bo";
  const { data } = await axiosInstance.get("api/v1/topics", {
    params: {language, ...(parentId && { parent_id: parentId })}
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

  const { data: topicsData, isLoading: topicsIsLoading } = useQuery(
    ["topics", parentId],
    () => fetchTopics(parentId),
    { refetchOnWindowFocus: false }
  );
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  if(topicsIsLoading){
    return <p>Loading ...</p>
  }

  const topicsList = {
    "topics": [
      {
        "id": "71adcc30-cfaa-4aee-9c1c-bda059a48e9e",
        "title": "Topic 1"
      },
      {
        "id": "5b8ed517-37c0-4daf-8ad9-a730c8d2f3ce",
        "title": "Topic 2"
      },
      {
        "id": "2fc5e913-3ed9-4e72-a630-b93d86a4ecfb",
        "title": "Topic 3"
      },
      {
        "id": "28d6e7bb-6bd3-41b0-9a72-474bfff146d3",
        "title": "Topic 4",
        "parent_id": {
          "id": "28d6e7bb-6bd3-41b0-9a72-474bfff146d3",
          "title": "Topic 4"
        }
      },
      {
        "id": "b87890b5-405a-41bf-8403-e06c7bad0ebb",
        "title": "Topic 5"
      }
    ]
  }
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
    const filteredTopics = topicsList["topics"].filter((topic) => {
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
        {filteredTopics.map((topic, index) => (
          <Col key={index}>
            <Card className="topic-card">
              <button className="topic-button" onClick={() => handleTopicClick(topic)}>
                {topic.title}
              </button>
            </Card>
          </Col>
        ))}
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
    return <h4 className="topics-title">
      {parentId && id ? t(`topic.${parentId}`) : t("topics.explore_by_topic")}
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
        {alphabet.map((letter) => (
          <Button
            key={letter}
            variant={selectedLetter === letter ? "primary" : "outline-secondary"}
            className="alphabet-button"
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </Button>
        ))}
        <Button variant={"dark"} className="clear-letter-click" onClick={() =>setSelectedLetter("")}>
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