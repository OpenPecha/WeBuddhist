import React from 'react';
import { Link } from 'react-router-dom';
import { IoChevronForwardSharp } from 'react-icons/io5';
import './Breadcrumbs.scss';
import PropTypes from 'prop-types';

const Breadcrumbs = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumbs-container navbaritems" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path || index} className="breadcrumbs-item">
              {!isLast ? (
                <>
                  <Link to={item.path} className="breadcrumbs-link">{item.label}</Link>
                  <IoChevronForwardSharp className="breadcrumbs-separator" />
                </>
              ) : (
                <span className="breadcrumbs-current">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string
    })
  ).isRequired
};

export default Breadcrumbs;
