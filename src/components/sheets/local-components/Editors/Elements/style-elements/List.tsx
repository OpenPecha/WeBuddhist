import React from 'react'
import PropTypes from "prop-types";
const List = (props) => {
  const { attributes, children, element } = props

  const listStyles = {
    paddingLeft: '2em',
    margin: '0.5em 0',
    textAlign: element.align || 'left'
  }

  if (element.type === 'ordered-list') {
    return (
      <ol {...attributes} style={listStyles}>
        {children}
      </ol>
    )
  }
  
  return (
    <ul {...attributes} style={listStyles}>
      {children}
    </ul>
  )
}

export default List
List.propTypes = {
  attributes: PropTypes.object.isRequired, 
  children: PropTypes.node.isRequired, 
  element: PropTypes.shape({
    align: PropTypes.string, 
    type: PropTypes.string
  }).isRequired
}