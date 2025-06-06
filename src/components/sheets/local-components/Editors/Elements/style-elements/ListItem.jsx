import React from 'react'

const ListItem = (props) => {
  const { attributes, children } = props
  return (
    <li {...attributes}>
      {children}
    </li>
  )
}

export default ListItem
