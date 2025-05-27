import React from 'react'
import { useSlate } from 'slate-react';
import CustomEditor from '../../sheet-utils/CustomEditor';


const blockButton = (prop) => {
    const {format,children} = prop 
    const editor=useSlate()
    const isActive = CustomEditor.isBlockActive(editor, format)
  return (
    <button 
    onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleBlock(editor, format); }}
    className={isActive ? 'active' : ''}>
        {children}
    </button>
  )
}

export default blockButton