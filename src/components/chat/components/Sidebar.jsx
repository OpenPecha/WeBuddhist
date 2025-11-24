import { useState, useRef, useEffect } from 'react';
import { BsThreeDots, BsTrash } from 'react-icons/bs';
import { NavbarIcon } from '../../../utils/Icon';
import { useChatStore } from '../store/chatStore';
import { IoCreateOutline } from "react-icons/io5";

export function Sidebar({ isOpen, onToggle }) {
  const { threads, activeThreadId, createThread, setActiveThread, deleteThread } = useChatStore();
  const [openPopoverId, setOpenPopoverId] = useState(null);
  const popoverRef = useRef(null);

  const handleTogglePopover = (e, threadId) => {
    e.stopPropagation();
    setOpenPopoverId(openPopoverId === threadId ? null : threadId);
  };

  const handleDeleteClick = (e, threadId) => {
    e.stopPropagation();
    deleteThread(threadId);
    setOpenPopoverId(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpenPopoverId(null);
      }
    };

    if (openPopoverId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openPopoverId]);

  return (
    <div className={`h-full bg-[#F5F5F5] flex flex-col rounded-r-2xl mt-3 transition-all duration-300 ease-in-out  ${
      isOpen ? ' w-72' : 'w-0 overflow-hidden'
    }`}>
      <div className=' p-2 flex items-center justify-between'>
        
      <div className="p-2 rounded-2xl">
        <button
          onClick={() => createThread()}
          className="w-full flex justify-left items-center px-2 py-2 hover:bg-gray-50 transition-colors cursor-pointer gap-2 text-[#18345D] text-sm rounded"
        >
          <IoCreateOutline size={18} />
          New Chat
        </button>
      </div>
      <button
        onClick={onToggle}
        className=" w-fit text-[#2c4d7f] "
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
      >
       <NavbarIcon/>
      </button>
      </div>


      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="px-3 py-2 w-full text-left border-t border-dashed border-[#cccccc] text-xs font-semibold text-gray-500 uppercase tracking-wider">
          History
        </div>
        <div className='space-y-2'>
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`
              group flex items-center justify-between px-3 py-2 rounded-lg  cursor-pointer transition-colors
              ${activeThreadId === thread.id 
                ? ' text-[#18345D]' 
                : 'hover:bg-gray-50'
              }
            `}
            onClick={() => setActiveThread(thread.id)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className={`text-sm truncate ${activeThreadId === thread.id ? ' border-l-2 border-[#78797c] pl-2' : 'text-gray-400'}`}>
                {thread.title}
              </span>
            </div>
            
            <div className="relative">
              <button
                onClick={(e) => handleTogglePopover(e, thread.id)}
                className="group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-[#18345D] transition-all">
                <BsThreeDots size={14} />
              </button>
              {openPopoverId === thread.id && (
                <div
                  ref={popoverRef}
                  className="absolute text-sm right-0  w-40 bg-[#FFFFFF] rounded-lg shadow-sm border border-gray-200 py-1 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => handleDeleteClick(e, thread.id)}
                    className="w-full flex items-center gap-2 px-2 py-1 transition-colors"
                  >
                    <BsTrash size={14} fill='red' />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        </div>
        {threads.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
            No chats yet
          </div>
        )}
      </div>
    </div>
  );
}
