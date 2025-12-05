import './CustomPecha.scss';
import PropTypes from "prop-types";
const CustomPecha = props => {
    const {attributes, element} = props
    if (!element.src) return null
    return (
      <div {...attributes} className="custom-webuddhist-container">
        <div contentEditable={false} className="custom-webuddhist-wrapper">
            <a href={element.url} target="_blank" rel="noopener noreferrer" className="custom-webuddhist-link">
                <img src={element.src} alt={element.segmentId} className="custom-webuddhist-image" />
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