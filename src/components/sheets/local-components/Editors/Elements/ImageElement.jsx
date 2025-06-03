const ImageElement = props => {
    return (
      <div {...props.attributes}>
        <div contentEditable={false}>
          <img 
            className="sheet-image"
            src={props.element.src} 
            alt={props.element.alt}
          />
        </div>
      </div>
    )
  }
  
  export default ImageElement