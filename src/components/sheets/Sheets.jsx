import React, { useMemo } from 'react'
import './Sheets.scss'
import Editor from './local-components/Editors/EditorWrapper'
import ProfileCard from './local-components/UserProfileCard/ProfileCard'

const defaultValue = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
    align: 'left'
  }
]

const Sheets = () => {
  const initialValue = useMemo(
    () =>
      JSON.parse(localStorage.getItem('sheets-content')) || defaultValue,
    []
  )

  return (
    <div className="sheets-wrapper">
      <input type="text" className="content title-input" placeholder='Enter the title here'/>
      <ProfileCard />
      <Editor initialValue={initialValue}>
        <Editor.Toolbar />
        <Editor.Input />
      </Editor>
    </div>
  )
}

export default Sheets

