import './CustomPecha.scss';
import PropTypes from "prop-types";
const CustomPecha = props => {
    const {attributes, element} = props
    if (!element.src) return null
    return (
      <div {...attributes} className="custom-pecha-container">
        <div contentEditable={false} className="custom-pecha-wrapper">
            <a href={element.url} target="_blank" rel="noopener noreferrer" className="custom-pecha-link">
                <img src={element.src} alt={element.segmentId} className="custom-pecha-image" />
            </a>
        </div>
      </div>
    )
  }
  
  export default CustomPecha
  CustomPecha.propTypes = {
    attributes: PropTypes.object.isRequired, 
    children: PropTypes.node.isRequired, 
    element: PropTypes.shape({
        src: PropTypes.string, 
        url: PropTypes.string, 
        segmentId: PropTypes.string
    }).isRequired
  }