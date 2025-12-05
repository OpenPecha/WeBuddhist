import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createEditor } from 'slate';
import { Slate, withReact } from 'slate-react';
import withEmbeds from '../../sheet-utils/withEmbeds.ts';
import EditorInput from './EditorInput/EditorInput.tsx';
import Toolsbar from '../Toolbar/Toolsbar.tsx';
import { withHistory } from 'slate-history';
import { useDebounce } from 'use-debounce';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../config/axios-config.ts';
import { createPayload } from '../../sheet-utils/Constant.ts';

export const createSheet = async (payload) => {
  const accessToken = sessionStorage.getItem('accessToken');
  const { data } = await axiosInstance.post('/api/v1/sheets', payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return data

};

export const updateSheet = async (sheet_id, payload) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.put(
    `/api/v1/sheets/${sheet_id}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return data;
};
const Editor = ({ initialValue, children, title, onTitleError }) => {
  const [editor] = useState(() => withHistory(withEmbeds(withReact(createEditor()))));
  const [value, setValue] = useState(initialValue);
  const [debouncedValue] = useDebounce(value, 1000);
  const { id } = useParams();
  const navigate = useNavigate();
  const [sheetId, setSheetId] = useState(id === 'new' ? null : id);
 const hasCreatedSheet=useRef(false)
  const [saveStatus, setSaveStatus] = useState('idle');

  const handleNavigation = useCallback(
    (newSheetId) => {
      const newUrl = window.location.pathname.replace('/new', `/${newSheetId}`);
      navigate(newUrl, { replace: true });
    },
    [navigate]
  );

    const handleChange = (value) => {
    setValue(value);
    const isAstChange = editor.operations.some(
      op => 'set_selection' !== op.type
    )
    if (isAstChange) {
      const content = JSON.stringify(value)
      sessionStorage.setItem('sheets-content', content)
    }
  };

  const saveSheet = useCallback(
    async (content) => {
      try {
        setSaveStatus('saving');
        const payload = createPayload(content, title);
        if (!sheetId) {
          const response = await createSheet(payload);
          const newSheetId = response.sheet_id;
          setSheetId(newSheetId);
          handleNavigation(newSheetId);
          hasCreatedSheet.current=true
          setSaveStatus('saved');
          if (onTitleError) {
            onTitleError(null);
          }
          return;
        }
        await updateSheet(sheetId, payload);
        setSaveStatus('saved');
        if (onTitleError) {
          onTitleError(null);
        }
      } catch (error) {
        setSaveStatus('idle');
        console.error('Error saving sheet:', error);
        if (error.response?.status === 400) {
          if (onTitleError) {
            onTitleError(error.response?.data?.detail);
          }
        }
      }
    },
    [sheetId, handleNavigation, title]
  );

  useEffect(() => {
    if (hasCreatedSheet.current) {
      hasCreatedSheet.current = false; //so that at first creation of sheet, it doesn't trigger put req
      return;
    }
    if (!debouncedValue) return;
    const hasContentChanged = JSON.stringify(debouncedValue) !== JSON.stringify(initialValue);
    if (!hasContentChanged) return;
    saveSheet(debouncedValue);
  }, [debouncedValue, initialValue, saveSheet]);

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={handleChange}
    >
      <Toolsbar editor={editor} value={value} title={title} sheetId={sheetId} saveStatus={saveStatus} />
      {React.Children.map(children, (child) => React.cloneElement(child, { editor }))}
    </Slate>
  );
};

Editor.Input = EditorInput;
Editor.Toolbar = Toolsbar;

export default Editor;