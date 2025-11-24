import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Square, Menu } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { streamChat, saveChatToBackend } from '../api/chat';
import { MessageBubble } from './MessageBubble';
import { SearchResults } from './SearchResults';
import { Queries } from './Queries';
import { WritingIndicator } from './WritingIndicator';
import { NavbarIcon } from '../../../utils/Icon';
import Questions from './questions/Questions';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../../../config/AuthContext';
import { useQuery } from 'react-query';
import axiosInstance from '../../../config/axios-config';

export const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get("/api/v1/users/info");
  return data;
};

export function ChatArea({ isSidebarOpen, onOpenSidebar }) {
  const { 
    threads, 
    activeThreadId, 
    addMessage, 
    updateLastMessage, 
    isLoading, 
    setLoading,
    createThread 
  } = useChatStore();
  
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Get user information
  const { user } = useAuth0();
  const { isLoggedIn } = useAuth();
  const { data: userInfo } = useQuery("userInfo", fetchUserInfo, { 
    refetchOnWindowFocus: false, 
    enabled: isLoggedIn 
  });

  const activeThread = threads.find(t => t.id === activeThreadId);

  const getUserEmail = () => {
    return user?.email || userInfo?.email || 'test@webuddhist';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages, isLoading, isThinking]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      setIsThinking(false);
    }
  };

  const handleQuestionClick = (questionText) => {
    if (isLoading) return;
    
    const newThreadId = createThread();
    
    submitQuestion(questionText, newThreadId);
  };

  const submitQuestion = async (userMessageContent, threadId) => {
    // Add user message
    addMessage(threadId, { role: 'user', content: userMessageContent });
    
    // Add placeholder assistant message
    addMessage(threadId, { role: 'assistant', content: '' });
    setLoading(true);
    setIsThinking(true);

    const currentThread = threads.find(t => t.id === threadId);
    const messagesForApi = currentThread 
      ? [...currentThread.messages, { role: 'user', content: userMessageContent }]
      : [{ role: 'user', content: userMessageContent }];

    // Map to API format (remove id, timestamp, searchResults)
    const apiMessages = messagesForApi.map(m => ({
      role: m.role,
      content: m.content
    }));

    let fullResponse = '';
    let currentSearchResults = [];
    let currentQueries = null;

    // Create new AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    await streamChat(
      apiMessages,
      (chunk) => {
        setIsThinking(false);
        fullResponse += chunk;
        updateLastMessage(threadId, fullResponse, currentSearchResults, currentQueries, false);
      },
      (results) => {
        setIsThinking(false);
        currentSearchResults = [...currentSearchResults, ...results];
        updateLastMessage(threadId, fullResponse, currentSearchResults, currentQueries, false);
      },
      (queries) => {
        setIsThinking(false);
        currentQueries = queries;
        updateLastMessage(threadId, fullResponse, currentSearchResults, currentQueries, false);
      },
      async () => {
        updateLastMessage(threadId, fullResponse, currentSearchResults, currentQueries, true);
        setLoading(false);
        setIsThinking(false);
        abortControllerRef.current = null;

        try {
          const userEmail = getUserEmail();
          await saveChatToBackend(
            userEmail,
            userMessageContent,
            fullResponse,
            threadId
          );
        } catch (error) {
          console.error('Failed to save chat:', error);
        }
      },
      (error) => {
        if (error.name === 'AbortError') {
          return;
        }
        console.error('Chat error:', error);
        updateLastMessage(threadId, fullResponse + '\n\n[Error: Failed to get response]', currentSearchResults, currentQueries, true);
        setLoading(false);
        setIsThinking(false);
        abortControllerRef.current = null;
      },
      abortController.signal
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageContent = input;
    setInput('');
    
    let threadId = activeThreadId;
    if (!threadId) {
      threadId = createThread();
    }
    
    await submitQuestion(userMessageContent, threadId);
  };

  if (!activeThreadId) {
    return (
      <div className="flex-1 flex items-center h-full justify-center bg-white text-gray-400 relative">
        {!isSidebarOpen && (
          <button
            onClick={onOpenSidebar}
            className="absolute top-4 left-4 w-fit p-2 rounded-lg"
            aria-label="Open sidebar"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onOpenSidebar()}
          >
            <NavbarIcon/>
          </button>
        )}
        <div className="text-center h-full justify-center items-center flex flex-col gap-y-4 text-gray-400 ">
{/* <Questions /> */}
<div className="bg-linear-to-t   from-white via-white to-transparent m-4 md:m-0 ">
        <div className="border-2 border-[#f1f1f1] mx-auto rounded-2xl w-full md:w-2xl bg-[#F5F5F5]">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about Buddhist texts..."
              className="  w-full p-4  rounded-2xl border-2 border-[#F5F5F5] bg-white text-gray-900 focus:outline-none"
              disabled={isLoading}
            />
            <button
              type={isLoading ? "button" : "submit"}
              onClick={isLoading ? handleStop : undefined}
              disabled={!input.trim() && !isLoading}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded transition-colors ${
                isLoading 
                  ? 'text-[#18345D]' 
                  : 'text-[#18345D] disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isLoading ? <Square size={20} fill="currentColor" /> : <Send size={20} />}
            </button>
          </form>
          <Questions onQuestionClick={handleQuestionClick} />
        </div>
      </div>
        </div>
        
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-scroll flex flex-col h-full bg-white relative">
      {!isSidebarOpen && (
        <button
          onClick={onOpenSidebar}
          className="md:absolute p-4 md:left-4 md:top-4  w-fit md:p-2"
          aria-label="Open sidebar"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onOpenSidebar()}
        >
          <NavbarIcon/>
        </button>
      )}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {activeThread?.messages.map((message, index) => (
            <div key={message.id} className="flex flex-col">
              {/* {message.role === 'assistant' && message.queries && (
                <Queries queries={message.queries} />
              )} */}
              {/* {message.role === 'assistant' && message.searchResults && message.searchResults.length > 0 && (
                <SearchResults results={message.searchResults} />
              )} */}
              <MessageBubble 
                message={message} 
                isStreaming={isLoading && index === activeThread.messages.length - 1}
              />
            </div>
          ))}
          
          {isThinking && (
             <div className="flex gap-2 text-gray-400 text-sm  animate-pulse">
               <Loader2 className="animate-spin" size={16} />
               Thinking...
             </div>
          )}

          {isLoading && !isThinking && (
            <WritingIndicator />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-linear-to-t from-white via-white to-transparent">
        <div className="p-2 md:max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about Buddhist texts..."
              className="w-full p-4  rounded-full border-2 border-gray-200 bg-white text-gray-900 focus:outline-none"
              disabled={isLoading}
            />
            <button
              type={isLoading ? "button" : "submit"}
              onClick={isLoading ? handleStop : undefined}
              disabled={!input.trim() && !isLoading}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded transition-colors ${
                isLoading 
                  ? 'text-[#9daabd]' 
                  : 'text-[#18345D] disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isLoading ? <Square size={20} fill="currentColor" /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
