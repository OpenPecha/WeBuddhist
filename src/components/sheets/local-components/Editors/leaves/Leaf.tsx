import PropTypes from "prop-types";
const Leaf = props => {
  return (
    <span
      {...props.attributes}
      style={{ 
        fontWeight: props.leaf.bold ? 'bold' : 'normal',
        fontStyle: props.leaf.italic ? 'italic' : 'normal',
        textDecoration: props.leaf.underline ? 'underline' : 'none',
      }}
    >
      {props.children}
    </span>
  )
}

export default Leaf
Leaf.propTypes = {
  attributes: PropTypes.object.isRequired, 
  children: PropTypes.node.isRequired, 
  leaf: PropTypes.shape({
    bold: PropTypes.bool, 
    italic: PropTypes.bool, 
    underline: PropTypes.bool
  }).isRequired
}