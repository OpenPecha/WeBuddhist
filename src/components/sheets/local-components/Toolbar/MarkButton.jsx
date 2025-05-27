import React from 'react'
import CustomEditor from '../../sheet-utils/CustomEditor';
import { useSlate } from 'slate-react';

const MarkButton = (prop) => {
    const {format,children} = prop
    const editor=useSlate()
    const isActive = CustomEditor.isMarkActive(editor, format)
  return (
    <button 
    className={isActive ? 'active' : ''}
    onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleMark(editor, format); }}>
        {children}
    </button>

  )
}

export default MarkButton