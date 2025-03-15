import React from "react";
import { Pagination, Form } from "react-bootstrap";
import "./PaginationComponent.scss"

const PaginationComponent = ({ pagination, totalPages, handlePageChange, setPagination }) => {
  return (
    <div className="pagination-container">
      <Pagination>
        <Pagination.Prev
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        />
        {[...Array(totalPages).keys()].map(number => (
          <Pagination.Item
            key={number + 1}
            active={number + 1 === pagination.currentPage}
            onClick={() => handlePageChange(number + 1)}
          >
            {number + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === totalPages}
        />
      </Pagination>

      <Form.Group controlId="limitSelect" className="mb-3">
        <Form.Select
          value={pagination.limit}
          onChange={(e) => setPagination({ currentPage: 1, limit: Number(e.target.value) })}
        >
          <option value="10">10</option>
          <option value="12">12</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </Form.Select>
      </Form.Group>
    </div>
  );
};

export default PaginationComponent;
