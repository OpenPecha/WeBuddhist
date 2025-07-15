import {LANGUAGE} from "../../utils/constants.js";
import axiosInstance from "../../config/axios-config.js";
import {useQuery} from "react-query";
import {useMemo, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {Button, Card, Col, Container, Form, Pagination, Row} from "react-bootstrap";
import "./Topics.scss"
import React from "react";
import {useTranslate} from "@tolgee/react";
import {useDebounce} from "use-debounce";
import PaginationComponent from "../commons/pagination/PaginationComponent.jsx";
import {mapLanguageCode} from "../../utils/helperFunctions.jsx";

export const fetchTopics = async (parentId, searchFilter, limit, skip, hierarchy) => {
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
  const { t } = useTranslate();

  const parentId = searchParams.get("id") || null;
  const [searchFilter, setSearchFilter] = useState("");
  const [debouncedSearchFilter] = useDebounce(searchFilter, 700);
  const [searchMode, setSearchMode] = useState({ isDeepSearch: false, hierarchy: true });
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);
  const cleanAlphabetArray = useMemo(() => {
    return t("topic.alphabet").split("").filter(char => char.match(/[a-zA-Z.\u0F00-\u0FFF]/));
  }, [t]);

  const { data: topicsData, isLoading } = useQuery(
    ["topics", parentId, debouncedSearchFilter, pagination.currentPage, pagination.limit],
    () => fetchTopics(parentId, debouncedSearchFilter, pagination.limit, skip, searchMode.hierarchy),
    { refetchOnWindowFocus: false }
  );

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
  };

  const renderTopicsList = () => {
    const filteredTopics = topicsList.topics.filter((topic) => {
      if (searchFilter) {
        return topic.title.toLowerCase().startsWith(searchFilter.toLowerCase())
      }
      return true;
    });


    return (
      ((searchMode.isDeepSearch && searchFilter) || !searchMode.isDeepSearch) && (
        <>
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
          {filteredTopics.length > 0 && <Row>
            <PaginationComponent
            pagination={pagination}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            setPagination={setPagination}
          /></Row>}
        </>
      )
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
              onChange={(e) => setSearchFilter(e.target.value)}
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


  return (
    <Container fluid className="topics-container">
      <Row className="topics-wrapper">
        <Col xs={12} md={7} className="topics-list">
          <h4 className="topics-title listtitle">{parentId ? topicsData?.parent?.title : t("topic.expore")}</h4>
          {renderSearchBar()}
          {isLoading ? <p>Loading topics...</p> : renderTopicsList()}
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