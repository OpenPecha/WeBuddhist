import React from 'react';

const ImageElement = props => {
    const { attributes, children, element } = props;
    const { src, url } = element;
    const noImageUrl = "https://app-pecha-backend.s3.amazonaws.com/images/sheet_images/2fc1ea97-6e19-45f5-a3f4-be6e32b4fe4d/notreal.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA5FCD6NLK3T7GINFJ%2F20250614%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250614T051314Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=684113de3fba82a80f9de6f45a3ea9b7bc48d489f95ac1427b792f83ce4bb820"; 
    
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