import React from 'react';
import PropTypes from "prop-types";
const ImageElement = props => {
    const { attributes, children, element } = props;
    const { src, url } = element;
    const noImageUrl = "https://icrier.org/wp-content/uploads/2022/12/media-Event-Image-Not-Found.jpg"; 
    
    if (!src) {
        return (
            <div {...attributes}>
                {children}
                <p contentEditable={false}>
                    Image link: <a href={url} target="_blank" rel="noopener noreferrer">{url || 'Pasted image link'}</a>
                    {element.error && <span style={{color: 'red'}}> (Error: {element.error})</span>}
                </p>
            </div>
        );
    }

    return (
        <div {...attributes}>
            <div contentEditable={false} style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                <img
                    className="sheet-image"
                    src={src}
                    alt={element.alt || "Sheet image"}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = noImageUrl;
                    }}
                    style={{ maxWidth: '100%', height: 'auto' }}
                />
            </div>
        </div>
    );
};

export default ImageElement;
ImageElement.propTypes = {
    attributes: PropTypes.object.isRequired, 
    children: PropTypes.node.isRequired, 
    element: PropTypes.shape({
        src: PropTypes.string, 
        url: PropTypes.string, 
        alt: PropTypes.string,
        error: PropTypes.string
    }).isRequired
}