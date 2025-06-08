import React from 'react'
import { useSlate } from 'slate-react';
import CustomEditor from '../../sheet-utils/CustomEditor';


const blockButton = (prop) => {
    const {format, children, className} = prop 
    const editor = useSlate()
    const isActive = CustomEditor.isBlockActive(editor, format)
  return (
    <button 
      className={`${className || ''} ${isActive ? 'active' : ''}`}
      onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleBlock(editor, format); }}>
      {children}
    </button>
  )
}

export default blockButton