import React, { useMemo, useState, useEffect } from 'react'
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

// Helper function to get saved sheet data from browser's localStorage
const getSavedData = () => {
  try {
    const savedContent = localStorage.getItem('sheets-content');
    const savedTitle = localStorage.getItem('sheets-title');
    const isPublished = localStorage.getItem('is_published') === 'true';
    
    return {
      content: savedContent ? JSON.parse(savedContent) : null,
      title: savedTitle || '',
      is_published: isPublished
    };
  } catch (error) {
    console.error('Error loading saved data:', error);
    return {
      content: defaultValue,
      title: '',
      is_published: false
    };
  }
};

const Sheets = () => {
  const { t } = useTranslate();
  const [title, setTitle] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  
  const initialValue = useMemo(() => {
    const { content, title: savedTitle, is_published } = getSavedData();
    setTitle(savedTitle);
    setIsPublished(is_published);
    return content || defaultValue;
  }, []);

  useEffect(() => {
    if (title !== '') {
      localStorage.setItem('sheets-title', title);
      localStorage.setItem('is_published', isPublished.toString());
    }
  }, [title, isPublished]);

  return (
    <div className="sheets-wrapper">
      <input 
        type="text" 
        style={{fontFamily:"serif"}} 
        className="title-input" 
        placeholder={t("sheet.title.placeholder")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <ProfileCard />
      <Editor 
        initialValue={initialValue}
        isPublished={isPublished}
      >
        <Editor.Toolbar />
        <Editor.Input />
      </Editor>
    </div>
  )
}

export default Sheets
