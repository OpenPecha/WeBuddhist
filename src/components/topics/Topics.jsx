import {LANGUAGE, mapLanguageCode} from "../../utils/Constants.js";
import axiosInstance from "../../config/axios-config.js";
import {useQuery} from "react-query";
import {useEffect, useMemo, useState} from "react";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {Button, Card, Col, Container, Form, Pagination, Row} from "react-bootstrap";
import "./Topics.scss"
import React from "react";
import {useTranslate} from "@tolgee/react";
import {useDebounce} from "use-debounce";

const fetchTopics = async (parentId, searchTerm, limit, skip) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "bo";

  const { data } = await axiosInstance.get("api/v1/topics", {
    params: {
      language,
      ...(parentId && { parent_id: parentId }),
      ...(searchTerm && { search: searchTerm }),
      limit,
      skip,
    },
  });

  return data;
};

const Topics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate()
  const { t } = useTranslate();
  const [parentId, setParentId] = useState(searchParams.get("id") || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 700);
  const [selectedLetter, setSelectedLetter] = useState("");
  const translatedKey = t("topic.alphabet");
  const cleanAlphabetArray = translatedKey.split("").filter((char) => char.match(/[a-zA-Z.\u0F00-\u0FFF]/));
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const skip = useMemo(() =>{
    return (currentPage - 1) * limit;
  },[currentPage])

  const { data: topicsData, isLoading } = useQuery(
    ["topics", parentId, debouncedSearchTerm, selectedLetter, currentPage, limit],
    () => fetchTopics(parentId, debouncedSearchTerm, limit, skip),
    { refetchOnWindowFocus: false }
  );

  const totalTopics = topicsData?.total || 0;
  const totalPages = Math.ceil(totalTopics / limit);
  const topicsList = topicsData || { topics: [], total: 0, skip: 0, limit: 12 };

  useEffect(() => {
    setParentId(searchParams.get("id"))
  }, [location])

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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };

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
      if (selectedLetter) {
        return topic.title.startsWith(selectedLetter);
      }
      return true;
    });

    return (
      <div className="topics-scrollable-area ">
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
      </div>
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
      {parentId ? topicsData.parent?.title : t("topic.expore")}
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

  const renderPagination = () => {
    return (
      <div className="pagination-wrapper">
        <div className="pagination-container">
          <Pagination>
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {[...Array(totalPages).keys()].map((number) => (
              <Pagination.Item
                key={number + 1}
                active={number + 1 === currentPage}
                onClick={() => handlePageChange(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          </Pagination>
          <Form.Group controlId="limitSelect" className="mb-3">
            <Form.Select value={limit} onChange={handleLimitChange}>
              <option value="10">10</option>
              <option value="12">12</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </Form.Select>
          </Form.Group>
        </div>
      </div>
    );
  }
  return (
    <Container fluid className="topics-container border">
      <Row className="topics-wrapper">
        <Col xs={12} md={7} className="topics-list">
          {renderTopicTitle()}
          {renderSearchBar()}
          <div className="topics-content">
            {renderTopicsList()}
            {renderPagination()}
          </div>
        </Col>

        <Col xs={12} md={4} className="topic-info">
          {renderTopicsInfo()}
        </Col>
      </Row>
      
    </Container>
  );
};

export default React.memo(Topics);