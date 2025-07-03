import PropTypes from "prop-types";
const CodeElement = props => {
  const { attributes, children, element } = props;
  const quoteStyle = {
    margin: '10px',
    padding: '10px 15px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #555',
    color: '#555',
    textAlign: element.align || 'left'
  };
    return (
      <pre {...attributes} style={quoteStyle}>
        <code>{children}</code>
      </pre>
    )
  }
  
  export default CodeElement
  CodeElement.propTypes = {
    attributes: PropTypes.object.isRequired, 
    children: PropTypes.node.isRequired, 
    element: PropTypes.shape({
        align: PropTypes.string
    }).isRequired
  }