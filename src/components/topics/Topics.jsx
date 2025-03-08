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


const fetchTopics = async (parentId, searchFilter, limit, skip, hierarchy) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "bo";

  const { data } = await axiosInstance.get("api/v1/topics", {
    params: {
      language,
      ...(parentId && { parent_id: parentId }),
      ...(searchFilter && { search: searchFilter }),
      limit,
      skip,
      hierarchy
    },
  });

  return data;
};

const Topics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslate();
  const location = useLocation();

  const parentId = searchParams.get("id") || null;
  const [searchFilter, setSearchFilter] = useState("");
  const [debouncedSearchFilter] = useDebounce(searchFilter, 700);
  const [searchMode, setSearchMode] = useState({ isDeepSearch: false, hierarchy: true });
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);
  const cleanAlphabetArray = useMemo(() => {
    return t("topic.alphabet").split("").filter(char => char.match(/[a-zA-Z.\u0F00-\u0FFF]/));
  }, [t]);

  const shouldFetchData = useMemo(() => {
    if (!searchMode.isDeepSearch) return true;
    
    if (!searchFilter) return true; 
    if (cleanAlphabetArray.includes(searchFilter)) return true; 
    return searchFilter.length >= 3; 
  }, [searchFilter, cleanAlphabetArray, searchMode.isDeepSearch]);

  const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
    if (searchFilter !== debouncedSearchFilter) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [searchFilter, debouncedSearchFilter]);

  const { data: topicsData, isLoading: isLoadingFromQuery } = useQuery(
    ["topics", parentId, debouncedSearchFilter, pagination.currentPage, pagination.limit, searchMode.hierarchy],
    () => fetchTopics(parentId, debouncedSearchFilter, pagination.limit, skip, searchMode.hierarchy),
    { 
      refetchOnWindowFocus: false,
      enabled: shouldFetchData,
    }
  );
  const isLoading = isLoadingFromQuery || (isTyping && searchFilter.length >= 3);

  const totalTopics = topicsData?.total || 0;
  const totalPages = Math.ceil(totalTopics / pagination.limit);
  const topicsList = topicsData || { topics: [], total: 0, skip: 0, limit: 12 };

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, currentPage: pageNumber }));
  };

  const handleLimitChange = (e) => {
    setPagination({ currentPage: 1, limit: Number(e.target.value) });
  };

  const handleTopicClick = (topic) => {
    if (topic?.has_child) {
      setSearchParams({ id: topic.id });
    }
  };

  const onDeepSearchButtonClick = () => {
    setSearchMode({ isDeepSearch: true, hierarchy: false });
    setSearchParams("");
    setSearchFilter("");
  };

  const handleSearchChange = (e) => {
    setSearchFilter(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const renderTopicsList = () => {
    if (searchMode.isDeepSearch && 
        searchFilter && 
        searchFilter.length < 3 && 
        !cleanAlphabetArray.includes(searchFilter)) {
      return (
        <Row>
          <Col>
            <p>Enter at least 3 characters to search</p>
          </Col>
        </Row>
      );
    }

    if (isLoading) {
      return (
        <Row>
          <Col>
            <p>Loading topics...</p>
          </Col>
        </Row>
      );
    }

    if (!shouldFetchData) {
      return (
        <Row>
          <Col>
            <p>Enter at least 3 characters to search</p>
          </Col>
        </Row>
      );
    }

    return (
      <>
        <Row xs={1} md={2} className="g-4">
          {topicsList.topics.length > 0 ? (
            topicsList.topics.map((topic, index) => (
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
        {topicsList.topics.length > 0 && <Row>{renderPagination()}</Row>}
      </>
      
    );
  };

  const renderSearchBar = () => {
    return (
      <div className="search-container">
        {searchMode.isDeepSearch ? (
          <>
            <Form.Control
              type="text"
              placeholder="Search topics..."
              value={searchFilter}
              onChange={handleSearchChange}
              className="mb-3"
            />
            <div className="alphabet-filter">
              {cleanAlphabetArray.map((letter, index) => (
                <Button
                  key={index}
                  variant={searchFilter === letter ? "secondary" : "outline-secondary"}
                  className="alphabet-button listsubtitle"
                  onClick={() => setSearchFilter(letter)}
                >
                  {letter}
                </Button>
              ))}
              <Button variant="outline-dark" className="clear-letter-click" onClick={() => setSearchFilter("")}>
                {t("topic.clear")}
              </Button>
            </div>
            <Button
              className="back-button"
              variant="outline-secondary"
              onClick={() => {
                setSearchMode({ isDeepSearch: false, hierarchy: true });
                setSearchFilter("");
                setSearchParams("");
              }}
            >
              Back
            </Button>
          </>
        ) : (
          <div className="deep-search-container">
            <Button className="deep-search-button" variant="outline-secondary" onClick={onDeepSearchButtonClick}>
              {t("topic.a_to_z")}
            </Button>
            <p>{t("topic.browse_topic")}</p>
          </div>
        )}
      </div>
    );
  };

  const renderPagination = () => {
    return (
      <div className="pagination-container">
        <Pagination>
          <Pagination.Prev onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} />
          {[...Array(totalPages).keys()].map(number => (
            <Pagination.Item
              key={number + 1}
              active={number + 1 === pagination.currentPage}
              onClick={() => handlePageChange(number + 1)}
            >
              {number + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === totalPages} />
        </Pagination>
        <Form.Group controlId="limitSelect" className="mb-3">
          <Form.Select value={pagination.limit} onChange={handleLimitChange}>
            <option value="10">10</option>
            <option value="12">12</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </Form.Select>
        </Form.Group>
      </div>
    );
  };

  return (
    <Container fluid className="topics-container">
      <Row className="topics-wrapper">
        <Col xs={12} md={7} className="topics-list">
          <h4 className="topics-title listtitle">{parentId ? topicsData?.parent?.title : t("topic.expore")}</h4>
          {renderSearchBar()}
          {renderTopicsList()}
        </Col>
        <Col xs={12} md={4} className="topic-info">
          <Card className="topic-info-card">
            <Card.Body>
              <h5>Topic Information</h5>
              <p>Details about the selected topic will be displayed here.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default React.memo(Topics);