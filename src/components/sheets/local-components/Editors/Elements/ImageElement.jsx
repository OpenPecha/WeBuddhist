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
        {props.children}
      </div>
    )
  }
  
  export default ImageElement