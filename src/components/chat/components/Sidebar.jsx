import { BsThreeDots } from 'react-icons/bs';
import { NavbarIcon } from '../../../utils/Icon';
import { useChatStore } from '../store/chatStore';
import { IoCreateOutline } from "react-icons/io5";

export function Sidebar({ isOpen, onToggle }) {
  const { threads, activeThreadId, createThread, setActiveThread, deleteThread } = useChatStore();

  return (
    <div className={`h-full bg-[#F5F5F5] flex flex-col rounded-r-2xl mt-3 transition-all duration-300 ease-in-out  ${
      isOpen ? ' w-72' : 'w-0 overflow-hidden'
    }`}>
      <div className=' p-2 flex justify-end'>
      <button
        onClick={onToggle}
        className=" w-fit  p-2 text-[#2c4d7f] "
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
      >
       <NavbarIcon/>
      </button>
      </div>

      <div className="p-2 rounded-2xl">
        <button
          onClick={() => createThread()}
          className="w-full flex justify-left items-center px-2 py-2 hover:bg-gray-50 transition-colors cursor-pointer gap-2 text-[#18345D] text-sm rounded"
        >
          <IoCreateOutline size={18} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="px-3 py-2 w-full text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteThread(thread.id);
              }}
              className=" group-hover:opacity-100 p-1  rounded text-gray-400 hover:text-[#18345D] transition-all"
            >
              {/* <Trash2 size={14} /> */}
              <BsThreeDots size={14} />
            </button>
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
