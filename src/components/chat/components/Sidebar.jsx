import { useChatStore } from '../store/chatStore';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

export function Sidebar() {
  const { threads, activeThreadId, createThread, setActiveThread, deleteThread } = useChatStore();

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 bg flex flex-col">
      <div className="p-4 rounded-2xl">
        <button
          onClick={() => createThread()}
          className="w-full  flex items-center justify-center gap-2 bg-[#18345D] text-white px-4 py-2 transition-colors font-medium text-sm rounded"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          History
        </div>
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`
              group flex items-center justify-between p-3 rounded-lg mb-1 cursor-pointer transition-colors
              ${activeThreadId === thread.id 
                ? 'bg-[#18345D]/10 text-[#18345D]' 
                : 'hover:bg-gray-50'
              }
            `}
            onClick={() => setActiveThread(thread.id)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <MessageSquare size={16} className="text-gray-500 shrink-0" />
              <span className={`text-sm truncate ${activeThreadId === thread.id ? 'font-medium' : 'text-gray-700'}`}>
                {thread.title}
              </span>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteThread(thread.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#18345D]/10 rounded text-gray-400 hover:text-[#18345D] transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        
        {threads.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
            No chats yet
          </div>
        )}
      </div>
    </div>
  );
}
