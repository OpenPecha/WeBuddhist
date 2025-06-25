import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createEditor } from 'slate';
import { Slate, withReact } from 'slate-react';
import withEmbeds from '../../sheet-utils/withEmbeds';
import EditorInput from './EditorInput/EditorInput';
import Toolsbar from '../Toolbar/Toolsbar';
import { withHistory } from 'slate-history';
import { useDebounce } from 'use-debounce';
import { serialize } from '../../sheet-utils/serialize';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../config/axios-config';

const createSheet = async (payload) => {
  // const refreshToken = localStorage.getItem('refreshToken');
  // const { data } = await axiosInstance.post('/api/v1/sheets', payload, {
  //   headers: {
  //     Authorization: `Bearer ${refreshToken}`
  //   }
  // });
  // return data
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('POST API called - Creating new sheet:', payload);
      resolve({
        data: {
          sheetid: '1234567890',
        },
      });
    }, 500);
  });

};

const updateSheet = async (sheetId, payload) => {

  // const refreshToken = localStorage.getItem('refreshToken');
  // const { data } = await axiosInstance.put(`/api/v1/sheets/${sheetId}`, payload, {
  //   headers: {
  //     Authorization: `Bearer ${refreshToken}`
  //   }
  // });
  // return data
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('PUT API called - Updating sheet:', payload);
      resolve({
        data: {
          success: true,
          message: 'Sheet updated successfully',
        },
      });
    }, 300);
  });
};

const createPayload = (value,title) => {
  const titles = title;
  const isPublic = false;

  const sources = value.map((node, i) => {
    if (['image', 'audio', 'video'].includes(node.type)) {
      return {
        position: i,
        type: node.type,
        content: node.src,
      };
    }
    if (node.type === 'pecha') {
      return {
        position: i,
        type: "SEGMENT",
        content: node.src,
      };
    }
    return {
      position: i,
      type: "CONTENT",
      content: serialize(node),
    };
  });

  return {
    titles,
    sources,
    isPublic
  };
};

const Editor = ({ initialValue, children,title }) => {
  const [editor] = useState(() => withHistory(withEmbeds(withReact(createEditor()))));
  const [value, setValue] = useState(initialValue);
  const [debouncedValue] = useDebounce(value, 1000);
  const { id } = useParams();
  const navigate = useNavigate();
  const [sheetId, setSheetId] = useState(id === 'new' ? null : id);
 const hasCreatedSheet=useRef(false)
  const handleNavigation = useCallback(
    (newSheetId) => {
      const newUrl = window.location.pathname.replace('/new', `/${newSheetId}`);
      navigate(newUrl, { replace: true });
    },
    [navigate]
  );

  const saveSheet = useCallback(
    async (content) => {
      try {
        const payload = createPayload(content, title);
        
        if (!sheetId) {
          const response = await createSheet(payload);
          const newSheetId = response.data.sheetid;
          setSheetId(newSheetId);
          handleNavigation(newSheetId);
          hasCreatedSheet.current=true
          return;
        }
        await updateSheet(sheetId, payload);
      } catch (error) {
        console.error('Error saving sheet:', error);
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
      onChange={setValue}
    >
      {React.Children.map(children, (child) => React.cloneElement(child, { editor }))}
    </Slate>
  );
};

Editor.Input = EditorInput;
Editor.Toolbar = Toolsbar;

export default Editor;