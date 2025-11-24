import { useState, useEffect } from 'react';
import {  ChevronDown, ChevronUp } from 'lucide-react';
import webuddhistlogo from "../../../assets/icons/pecha_icon.png";
import { useMutation } from 'react-query';
import axiosInstance from '../../../config/axios-config';

export const fetchURL = async (id) => {
  const {data} = await axiosInstance.get(`/api/v1/search/chat/${id}`);
  return data;
}

export function MessageBubble({ message, isStreaming = false }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);
  const [activePopover, setActivePopover] = useState(null);

  const urlMutation = useMutation(fetchURL, {
    onSuccess: (data) => {
      if (data) {
        window.open(data, '_blank', 'noopener,noreferrer');
      }
    },
    onError: (error) => {
      console.error('Error fetching URL:', error);
    }
  });

  // Close drawer on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showSources) {
          setShowSources(false);
        }
        if (activePopover !== null) {
          setActivePopover(null);
        }
      }
    };
    
    if (showSources) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    if (activePopover !== null) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showSources, activePopover]);

  const handleCitationMouseEnter = (uniqueId) => {
    setActivePopover(uniqueId);
  };

  const handleCitationMouseLeave = () => {
    setActivePopover(null);
  };

  const handleSourceClick = (sourceId) => {
    urlMutation.mutate(sourceId);
  };

  const handleSourceKeyDown = (event, sourceId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSourceClick(sourceId);
    }
  };

  // Process content for citations if it's an assistant message with search results
  const processContent = () => {
    if (isUser || !message.searchResults || message.searchResults.length === 0) {
      return { content: message.content, usedSources: [] };
    }

    let processedContent = message.content;
    const usedSources = [];
    const idToNumber = {};
    let citationCount = 0;

    const getNumberForId = (id) => {
      const trimmedId = id.trim();
      if (!trimmedId) return null;
      if (idToNumber[trimmedId]) return idToNumber[trimmedId];

      const source = message.searchResults?.find(s => s.id === trimmedId);
      if (source) {
        citationCount++;
        idToNumber[trimmedId] = citationCount;
        usedSources.push({ number: citationCount, source });
        return citationCount;
      }
      return null;
    };

    // Regex to match [id] patterns
    const citationRegex = /\[([a-zA-Z0-9\-_,\s]+)\]/g;
    
    const parts = [];
    let lastIndex = 0;

    processedContent.replace(citationRegex, (match, content, offset) => {
      // Push text before the match
      parts.push(processedContent.slice(lastIndex, offset));
      
      const ids = content.split(/[,\s]+/).filter((p) => p.trim().length > 0);
      const numbers = ids.map((id) => getNumberForId(id)).filter((n) => n !== null);

      if (numbers.length > 0) {
        parts.push(
          <sup key={offset} className="inline-flex gap-0.5 ml-0.5 relative">
            {numbers.map((num, idx) => {
              const sourceInfo = usedSources.find(s => s.number === num);
              const uniqueId = `${offset}-${idx}`;
              return (
                <span key={idx} className="relative inline-block">
                  <span 
                    className="citation-number inline-flex items-center justify-center w-4 h-4 text-[#18345D] p-2 border border-blue-200 rounded-full cursor-pointer hover:bg-blue-50 transition-colors"
                    onMouseEnter={() => handleCitationMouseEnter(uniqueId)}
                    onMouseLeave={handleCitationMouseLeave}
                    role="button"
                    tabIndex={0}
                    aria-label={`Show source ${num}`}
                  >
                    {num}
                  </span>
                  {activePopover === uniqueId && sourceInfo && (
                    <div 
                      className="citation-popover absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2  bg-gray-50 text-xs rounded-md shadow-sm whitespace-nowrap z-50 min-w-max max-w-xs"
                      style={{
                        opacity: 0,
                        animation: 'fadeInUp 0.2s ease-out forwards'
                      }}
                      onMouseEnter={() => handleCitationMouseEnter(uniqueId)}
                      onMouseLeave={handleCitationMouseLeave}
                    >
                      <div className="relative">
                        {sourceInfo.source.title}
                      </div>
                    </div>
                  )}
                </span>
              );
            })}
          </sup>
        );
      } else {
        // If no valid IDs found, keep original text if it looks like a citation
        // Heuristic: if content is long, it might not be a citation ID
        const looksLikeId = ids.some((p) => p.length > 15); 
        parts.push(looksLikeId ? match : "");
      }

      lastIndex = offset + match.length;
      return match;
    });

    parts.push(processedContent.slice(lastIndex));

    return { content: parts, usedSources: usedSources.sort((a, b) => a.number - b.number) };
  };

  const { content, usedSources } = processContent();

  return (
    <div className={`flex w-full`}>
      <div className={`flex items-center`}>
        {/* <div className={`
          w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-1
          ${isUser ? 'bg-[#18345D]/80 text-white' : 'bg-gray-200 text-gray-600'}
        `}>
          {isUser ? <User size={18} /> : <img src={webuddhistlogo} alt="Webuddhist" className="w-8 h-8" />}
        </div> */}
        {
          isUser && (
            <div className={`
          w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-1
          bg-gray-200 text-gray-600
        `}>
           <img src={webuddhistlogo} alt="Webuddhist" className="w-8 h-8" />
        </div>
          )
        }
        <div className={`flex text-left flex-col min-w-0`}>
          <div className={`
            p-3 leading-relaxed 
            ${isUser 
              ? ' text-black ' 
              : 'bg-white text-gray-800'
            }
          `}>
            <div className="whitespace-pre-wrap wrap-break-word">
              {!isStreaming && (content.length===0 || content[0]==="")  && "I couldn't find an answer to this within my library of Buddhist texts. Please try rephrasing your question or asking about a different concept."}
              {Array.isArray(content) ? content : message.content}
            </div>
          </div>

          {!isUser && usedSources && usedSources.length > 0 && (
            <div className=" w-full max-w-md">
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-2"
              >
                {showSources ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showSources ? 'Hide' : 'View'} {usedSources.length} Sources
              </button>

              {showSources && (
                <div className="grid gap-2">
                  {usedSources.map(({ number, source }, index) => (
                    <div 
                      key={number}
                      className="flex border-l border-[#abadb1] flex-col p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{
                        opacity: 0,
                        animation: 'fadeInUp 0.6s ease-out forwards',
                        animationDelay: `${index * 0.1}s`
                      }}
                      onClick={() => handleSourceClick(source.id)}
                      onKeyDown={(e) => handleSourceKeyDown(e, source.id)}
                      role="button"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="shrink-0 w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold text-[10px]">
                          {number}
                        </span>
                        <span className="font-medium text-gray-700 truncate">
                          {source.title || 'Unknown Source'}
                        </span>
                      </div>
                      <div className="text-gray-500 line-clamp-2 pl-6 italic">
                        "{source.text}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
