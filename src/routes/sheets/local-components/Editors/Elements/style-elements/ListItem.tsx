
const ListItem = (props) => {
  const { attributes, children, element } = props
  const style = element?.align ? { textAlign: element.align } : undefined
  return (
    <li {...attributes} style={style}>
      {children}
    </li>
  )
}

export default ListItem