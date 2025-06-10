import React, { useMemo, useState } from 'react';
import { IoClose } from "react-icons/io5";
import {useDebounce} from "use-debounce";
import "./SheetSegmentModal.scss";
import { Form } from 'react-bootstrap';
import { useQuery } from 'react-query';
import axiosInstance from "../../../../../config/axios-config";

export const fetchSegments = async (searchFilter, limit, skip) => {
  
    const { data } = await axiosInstance.get(`api/v1/search?query=${searchFilter}&type=${'segment'}`, {
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
  const { data: SearchData, isLoading } = useQuery(
    ["topics", debouncedSearchFilter, pagination.currentPage, pagination.limit],
    () => fetchSegments(debouncedSearchFilter, pagination.limit, skip),
    { refetchOnWindowFocus: false }
  );
  const renderModalHeader = () => {
    return (
      <>
        <p>Sheet Segment</p>
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
    return (
      <div className="segment-content">
  <Form.Control
              type="text"
              placeholder="Search topics..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="mb-3"
            />  
      </div>
    );
  };

  return (
    <div className="sheet-segment-overlay" onClick={onClose}>
      <div
        className="sheet-segment-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {renderModalHeader()}
        {renderSegmentContent()}
      </div>
    </div>
  );
};

export default SheetSegmentModal;