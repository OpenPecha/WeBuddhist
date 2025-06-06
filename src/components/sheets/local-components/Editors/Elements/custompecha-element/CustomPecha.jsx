
const CustomPecha = props => {
    const {attributes,children,element} = props
    if (!element.src) return null
    return (
      <div {...attributes}>
        <div contentEditable={false}>
            <a href={element.url} target="_blank" rel="noopener noreferrer">
                <img src={element.src} alt={element.segmentId} />
            </a>
        </div>
        {children}
      </div>
    )
  }
  
  export default CustomPecha