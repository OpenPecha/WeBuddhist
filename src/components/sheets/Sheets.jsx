import React, { useMemo, useState } from 'react'
import './Sheets.scss'
import Editor from './local-components/Editors/EditorWrapper'
import ProfileCard from './local-components/UserProfileCard/ProfileCard'
import { useTranslate } from '@tolgee/react';
import { useDebounce } from 'use-debounce';
const defaultValue = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
    align: 'left'
  }
]

const Sheets = () => {
  const {t} = useTranslate();
  const [title,setTitle]=useState("")
  const [debouncedTitle] = useDebounce(title, 1000);
  const initialValue = useMemo(
    () =>
      // JSON.parse(localStorage.getItem('sheets-content')) || defaultValue,
      defaultValue,
    []
  )

  return (
    <div className="sheets-wrapper">
      <input type="text" style={{fontFamily:"serif"}} value={title} onChange={(e)=>setTitle(e.target.value)} className=" title-input" placeholder={t("sheet.title.placeholder")}/>
      <ProfileCard />
      <Editor title={debouncedTitle} initialValue={initialValue}>
        <Editor.Toolbar />
        <Editor.Input />
      </Editor>
    </div>
  )
}

export default Sheets

