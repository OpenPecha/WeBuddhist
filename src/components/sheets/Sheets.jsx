import React, { useMemo, useState } from 'react'
import './Sheets.scss'
import Editor from './local-components/Editors/EditorWrapper'
import ProfileCard from './local-components/UserProfileCard/ProfileCard'
import { useTranslate } from '@tolgee/react';
import { useDebounce } from 'use-debounce';
import { useParams } from 'react-router-dom';
import { fetchSheetData } from './view-sheet/SheetDetailPage';
import { useQuery } from 'react-query';
import { convertSegmentsToSlate } from './sheet-utils/Constant';

const defaultValue = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
    align: 'left'
  }
]

const Sheets = () => {
  const {t} = useTranslate();
  const {id}=useParams();
  const shouldFetch = id !== 'new';
  const {data:sheetData}=useQuery({
    queryKey:['sheetData',id],
    queryFn:()=>fetchSheetData(id),
    enabled:shouldFetch
  })

  const [title,setTitle]=useState("")
  const [debouncedTitle] = useDebounce(title, 1000);
  const initialValue = useMemo(
    () =>
     sheetData && convertSegmentsToSlate(sheetData?.content?.segments) || defaultValue,
    []
  )
  return (
    <div className="sheets-wrapper">
      <input type="text" 
      style={{fontFamily:"serif"}} 
      value={ sheetData?.sheet_title || title} 
      onChange={(e)=>{setTitle(e.target.value); sessionStorage.setItem("sheet-title", e.target.value)}} 
      className=" title-input" placeholder={t("sheet.title.placeholder")}/>
      <ProfileCard />
      <Editor title={debouncedTitle || sheetData?.sheet_title} initialValue={initialValue}>
        <Editor.Input />
      </Editor>
    </div>
  )
}

export default Sheets

