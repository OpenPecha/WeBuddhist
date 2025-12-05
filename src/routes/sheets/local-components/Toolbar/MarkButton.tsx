import React from 'react'
import { useCustomEditor } from '../../sheet-utils/CustomEditor';
import { useSlate } from 'slate-react';

const MarkButton = (prop) => {
    const {format, children, className, title} = prop
    const editor = useSlate()
    const customEditor = useCustomEditor();
    const isActive = customEditor.isMarkActive(editor, format)
    
    return (
      <button 
        className={`${className || ''} ${isActive ? 'active' : ''}`}
        title={title}
        onMouseDown={(e) => { 
          e.preventDefault(); 
          customEditor.toggleMark(editor, format); 
        }}>
        {children}
      </button>
    )
}

export default MarkButton