import React from 'react';
import './DefaultElement.scss';
const DefaultElement = props => {
    const { element, attributes, children } = props;
    const style = {
      ...(element.align ? { textAlign: element.align } : {}),
      whiteSpace: 'pre-wrap' 
    };
    
    return (
      <p style={style} {...attributes} className="paragraph-with-indicator">
        <span className="newline-indicator"/>
        {children}
      </p>
    );
  }

export default DefaultElement
