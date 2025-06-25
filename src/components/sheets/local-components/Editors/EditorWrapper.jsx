import React, { useState, useCallback, useEffect } from 'react'
import { createEditor } from 'slate'
import { Slate, withReact } from 'slate-react'
import withEmbeds from '../../sheet-utils/withEmbeds'
import EditorInput from './EditorInput/EditorInput'
import Toolsbar from '../Toolbar/Toolsbar'
import { withHistory } from 'slate-history'

// Simple debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const Editor = (prop) => {
    const [editor] = useState(() => withHistory(withEmbeds(withReact(createEditor()))))
    const { initialValue, children, isPublished } = prop
    
    // Save content to localStorage with debouncing
    const saveToLocalStorage = useCallback(debounce((value) => {
        try {
            const content = JSON.stringify(value);
            localStorage.setItem('sheets-content', content);            
            localStorage.setItem('is_published', isPublished.toString());
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }, 300), [isPublished]);

    useEffect(() => {
        if (editor.children) {
            saveToLocalStorage(editor.children);
        }
    }, [isPublished, editor.children, saveToLocalStorage]);

    return (
        <Slate 
            editor={editor} 
            initialValue={initialValue}
            onChange={value => {
                const isAstChange = editor.operations.some(
                    op => 'set_selection' !== op.type
                );
                if (isAstChange) {
                    saveToLocalStorage(value);
                }
            }}
        >
            {React.Children.map(children, child => 
                React.cloneElement(child, { 
                    editor,
                    isPublished: isPublished 
                })
            )}
        </Slate>
    )
}

Editor.Input = EditorInput
Editor.Toolbar = Toolsbar
export default Editor