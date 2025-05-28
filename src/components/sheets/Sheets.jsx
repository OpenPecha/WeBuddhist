import React, { useMemo } from 'react'
import './Sheets.scss'
import Editor from './local-components/Editors/EditorWrapper'
import ProfileCard from './local-components/UserProfileCard/ProfileCard'

const defaultValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
  // {
  //   type:'image',
  //   children: [{ text: '' }],
  //   src: 'https://images.unsplash.com/photo-1745613184657-3c8dcd5f079a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  //   alt: 'Placeholder'
  // }
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

