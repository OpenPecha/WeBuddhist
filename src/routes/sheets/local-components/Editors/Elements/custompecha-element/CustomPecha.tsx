import './CustomPecha.scss';

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