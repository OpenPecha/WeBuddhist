import React from "react";
import "./PaginationComponent.scss"
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import { RiArrowDropDownLine } from "react-icons/ri";
import PropTypes from "prop-types";
const PaginationComponent = ({ pagination, totalPages, handlePageChange, setPagination }) => {
  return (
    <div className="pagination-container">
      <div className="pagination">
        <button
          className="page-link"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          <GrFormPrevious />
        </button>
        {[...Array(totalPages).keys()].map(number => (
          <button
            key={number + 1}
            className={`page-link ${number + 1 === pagination.currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(number + 1)}
          >
            {number + 1}
          </button>
        ))}
        <button
          className="page-link"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === totalPages}
        >
          <GrFormNext />
        </button>
      </div>

      <div className="form-group">
        <select
          value={pagination.limit}
          onChange={(e) => setPagination({ currentPage: 1, limit: Number(e.target.value) })}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="12">12</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <RiArrowDropDownLine className="dropdown-icon" />
      </div>
    </div>
  );
};

export default PaginationComponent;
PaginationComponent.propTypes = {
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired, 
    limit: PropTypes.number.isRequired
  }).isRequired, 
  totalPages: PropTypes.number.isRequired, 
  handlePageChange: PropTypes.func.isRequired, 
  setPagination: PropTypes.func.isRequired
}