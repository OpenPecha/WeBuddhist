import React, { useMemo, useState } from 'react';
import { IoClose } from "react-icons/io5";
import {useDebounce} from "use-debounce";
import "./SheetSegmentModal.scss";
import { Form } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from "../../../../../config/axios-config";
import PaginationComponent from '../../../../../components/commons/pagination/PaginationComponent';
import SourceItem from './SourceItem';
import PropTypes from 'prop-types';

export const fetchSegments = async (searchFilter, limit, skip) => {
  const { data } = await axiosInstance.get(`/api/v1/search?query=${searchFilter}&search_type=${'SOURCE'}`, {
    params: {
      limit,
      skip,
    },
  }); 
  return data;
};

const SheetSegmentModal = ({ onClose, onSegment }) => {
  const [searchFilter, setSearchFilter] = useState("");
  const [debouncedSearchFilter] = useDebounce(searchFilter, 500);
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(() => (pagination.currentPage - 1) * pagination.limit, [pagination]);
  const { data: searchData, isLoading } = useQuery(
    ["topics", debouncedSearchFilter, pagination.currentPage, pagination.limit],
    () => fetchSegments(debouncedSearchFilter, pagination.limit, skip),
    { refetchOnWindowFocus: false }
  );

  const totalSegments = searchData?.total || 0;
  const totalPages = Math.ceil(totalSegments / pagination.limit);

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, currentPage: pageNumber }));
  };
  
  const renderModalHeader = () => {
    return (
      <>
        <p className='search-segment-title listtitle'>Search Segment</p>
        <button
          className="close-button"
          onClick={onClose}
        >
          <IoClose />
        </button>
      </>
    );
  };

  const renderSegmentContent = () => {
    const sources = searchData?.sources || [];

    return (
      <div className="segment-content">
        <Form.Control
          type="text"
          placeholder="Search Segments..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
        />  
        <div className='segment-list-container'>
          {isLoading ? (
            <div className="state-message loading">
              <p>Loading segments...</p>
            </div>
          ) : sources.length === 0 ? (
            <div className="state-message empty">
              <p>No data found</p>
              <span className="empty-description">Try adjusting your search terms</span>
            </div>
          ) : (
            sources.map((source) => (
              <SourceItem
                key={source.text.text_id}
                source={source}
                onSegment={onSegment}
              />
            ))
          )}
        </div>
        <div className='segment-pagination-container'>
          <PaginationComponent
            pagination={pagination}
            totalPages={isLoading ? 1 : totalPages}
            handlePageChange={handlePageChange}
            setPagination={setPagination}
            disabled={isLoading}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="sheet-segment-overlay">
      <div className="sheet-segment-modal">
        {renderModalHeader()}
        {renderSegmentContent()}
      </div>
    </div>
  );
};

SheetSegmentModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSegment: PropTypes.func.isRequired,
};

export default SheetSegmentModal;