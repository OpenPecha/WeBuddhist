import './CustomPecha.scss';

const CustomPecha = props => {
    const {attributes,children,element} = props
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