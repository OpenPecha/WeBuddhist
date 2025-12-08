import React from 'react'
import PropTypes from "prop-types";
import { getLanguageClass } from "../../../../../../utils/helperFunctions.jsx";

const ListItem = (props) => {
  const { attributes, children, element } = props
  const style = element?.align ? { textAlign: element.align } : undefined
  
  return (
    <li {...attributes} style={style} className={getLanguageClass("en")}>
      {children}
    </li>
  )
}

export default ListItem
ListItem.propTypes = {
  attributes: PropTypes.object.isRequired, 
  children: PropTypes.node.isRequired,
  element: PropTypes.shape({
    align: PropTypes.string
  })
}