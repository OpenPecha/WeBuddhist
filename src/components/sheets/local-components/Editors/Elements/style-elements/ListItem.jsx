import React from 'react'
import PropTypes from "prop-types";
const ListItem = (props) => {
  const { attributes, children } = props
  return (
    <li {...attributes}>
      {children}
    </li>
  )
}

export default ListItem
ListItem.propTypes = {
  attributes: PropTypes.object.isRequired, 
  children: PropTypes.node.isRequired
}