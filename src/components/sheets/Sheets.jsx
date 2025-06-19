import React, { useMemo } from 'react'
import './Sheets.scss'
import Editor from './local-components/Editors/EditorWrapper'
import ProfileCard from './local-components/UserProfileCard/ProfileCard'
import { useTranslate } from '@tolgee/react';
const defaultValue = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
    align: 'left'
  }
]

const Sheets = () => {
  const {t} = useTranslate();
  const initialValue = useMemo(
    () =>
      // JSON.parse(localStorage.getItem('sheets-content')) || defaultValue,
      defaultValue,
    []
  )

  return (
    <div className="sheets-wrapper">
      <input type="text" style={{fontFamily:"serif"}} className=" title-input" placeholder={t("sheet.title.placeholder")}/>
      <ProfileCard />
      <Editor initialValue={initialValue}>
        <Editor.Toolbar />
        <Editor.Input />
      </Editor>
    </div>
  )
}

export default Sheets

