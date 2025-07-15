import React from 'react'
import { useSlate } from 'slate-react';
import { useCustomEditor } from '../../sheet-utils/CustomEditor';

const BlockButton = (prop) => {
    const {format, children, className} = prop 
    const editor = useSlate()
    const customEditor = useCustomEditor();
    const isActive = customEditor.isBlockActive(editor, format)
    
    return (
      <button 
        className={`${className || ''} ${isActive ? 'active' : ''}`}
        onMouseDown={(e) => { 
          e.preventDefault(); 
          customEditor.toggleBlock(editor, format); 
        }}>
        {children}
      </button>
    )
}

export default BlockButton