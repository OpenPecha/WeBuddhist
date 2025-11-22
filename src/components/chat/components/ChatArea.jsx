import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Square } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { streamChat } from '../api/chat';
import { MessageBubble } from './MessageBubble';
import { SearchResults } from './SearchResults';
import { WritingIndicator } from './WritingIndicator';

export function ChatArea() {
  const { 
    threads, 
    activeThreadId, 
    addMessage, 
    updateLastMessage, 
    isLoading, 
    setLoading 
  } = useChatStore();
  
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const activeThread = threads.find(t => t.id === activeThreadId);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeThreadId || isLoading) return;

    const userMessageContent = input;
    setInput('');
    
    // Add user message
    addMessage(activeThreadId, { role: 'user', content: userMessageContent });
    
    // Add placeholder assistant message
    addMessage(activeThreadId, { role: 'assistant', content: '' });
    setLoading(true);
    setIsThinking(true);

    const messagesForApi = activeThread 
      ? [...activeThread.messages, { role: 'user', content: userMessageContent }]
      : [{ role: 'user', content: userMessageContent }];

    // Map to API format (remove id, timestamp, searchResults)
    const apiMessages = messagesForApi.map(m => ({
      role: m.role,
      content: m.content
    }));

    let fullResponse = '';
    let currentSearchResults = [];

    // Create new AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    await streamChat(
      apiMessages,
      (chunk) => {
        setIsThinking(false);
        fullResponse += chunk;
        updateLastMessage(activeThreadId, fullResponse, currentSearchResults);
      },
      (results) => {
        setIsThinking(false);
        currentSearchResults = [...currentSearchResults, ...results];
        updateLastMessage(activeThreadId, fullResponse, currentSearchResults);
      },
      () => {
        setLoading(false);
        setIsThinking(false);
        abortControllerRef.current = null;
      },
      (error) => {
        if (error.name === 'AbortError') {
          console.log('Chat aborted');
          return;
        }
        console.error('Chat error:', error);
        updateLastMessage(activeThreadId, fullResponse + '\n\n[Error: Failed to get response]');
        setLoading(false);
        setIsThinking(false);
        abortControllerRef.current = null;
      },
      abortController.signal
    );
  };

  if (!activeThreadId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white text-gray-400">
        Select a chat or create a new one
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="max-w-3xl mx-auto">
          {activeThread?.messages.map((message) => (
            <div key={message.id} className="flex flex-col">
              {message.role === 'assistant' && message.searchResults && message.searchResults.length > 0 && (
                <SearchResults results={message.searchResults} />
              )}
              <MessageBubble message={message} />
            </div>
          ))}
          
          {isThinking && (
             <div className="flex items-center gap-2 text-gray-400 text-sm p-4 animate-pulse">
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

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-white via-white to-transparent">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about Buddhist texts..."
              className="w-full p-4 pr-12 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
              disabled={isLoading}
            />
            <button
              type={isLoading ? "button" : "submit"}
              onClick={isLoading ? handleStop : undefined}
              disabled={!input.trim() && !isLoading}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded transition-colors ${
                isLoading 
                  ? 'text-[#18345D]' 
                  : 'text-[#18345D] hover:bg-[#18345D] disabled:opacity-50 disabled:cursor-not-allowed'
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
