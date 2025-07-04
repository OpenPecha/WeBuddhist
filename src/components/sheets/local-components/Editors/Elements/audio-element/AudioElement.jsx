import React from 'react';
import PropTypes from "prop-types";
const AudioElement = props => {
    const { attributes, children, element } = props;
    const { src, url } = element; 

    if (!src) {
        return (
            <div {...attributes}>
                {children}
                <p contentEditable={false}>
                    Audio link: <a href={url} target="_blank" rel="noopener noreferrer">{url || 'Pasted audio link'}</a>
                    {element.error && <span style={{color: 'red'}}> (Error: {element.error})</span>}
                </p>
            </div>
        );
    }

    return (
        <div {...attributes}>
            <div contentEditable={false} style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                <iframe
                    width="100%"
                    height="166"
                    allow="autoplay"
                    src={src}
                    title="Audio Player"
                    style={{ border: 'none', overflow: 'hidden' }}
                ></iframe>
            </div>
        </div>
    );
};

export default AudioElement;
AudioElement.propTypes = {
    attributes: PropTypes.object.isRequired, 
    children: PropTypes.node.isRequired, 
    element: PropTypes.shape({
        src: PropTypes.string, 
        url: PropTypes.string, 
        error: PropTypes.string
    }).isRequired
}