import React from 'react';
import PropTypes from "prop-types";
const QuoteElement = (props) => {
  const { attributes, children, element } = props;
  
  const quoteStyle = {
    backgroundColor: '#f5f5f5',
    borderLeft: '4px solid #ccc',
    padding: '10px 15px',
    margin: '10px 0',
    fontStyle: 'italic',
    color: '#555',
    textAlign: element.align || 'left',
    whiteSpace: 'pre-wrap',
  };
  return (
    <blockquote style={quoteStyle} {...attributes}>
      {children}
    </blockquote>
  );
};

export default QuoteElement;
QuoteElement.propTypes = {
  attributes: PropTypes.object.isRequired, 
  children: PropTypes.node.isRequired, 
  element: PropTypes.shape({
    align: PropTypes.string
  }).isRequired
}