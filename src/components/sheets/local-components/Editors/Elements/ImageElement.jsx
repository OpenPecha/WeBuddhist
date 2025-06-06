import React from 'react';

const ImageElement = props => {
    const { attributes, children, element } = props;
    const { src, url } = element;

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
                    alt={element.alt || 'Sheet image'}
                    style={{ maxWidth: '100%', height: 'auto' }}
                />
            </div>
            {children}
        </div>
    );
};

export default ImageElement;