import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import webuddhistlogo from "../../../assets/icons/pecha_icon.png";
import { useMutation } from 'react-query';
import axiosInstance from '../../../config/axios-config';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export const fetchURL = async (id) => {
  const {data} = await axiosInstance.get(`/api/v1/search/chat/${id}`);
  return data;
}

export function MessageBubble({ message, isStreaming = false }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);
  const [activePopover, setActivePopover] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

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
    if (isUser || !message.searchResults || message.searchResults.length === 0 || !message.isFinalized) {
      return { content: message.content, usedSources: [], citationMap: {} };
    }

    let processedContent = message.content;
    const usedSources = [];
    const idToNumber = {};
    const citationMap = {};
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
        citationMap[citationCount] = source;
        return citationCount;
      }
      return null;
    };

    // Replace citation IDs with numbered citations in markdown format
    const citationRegex = /\[([a-zA-Z0-9\-_,\s]{15,})\]/g;
    let citationIndex = 0;
    
    processedContent = processedContent.replace(citationRegex, (match, idContent) => {
      const ids = idContent.split(/[,\s]+/).filter(id => id.trim().length > 0);
      const numbers = ids.map(id => getNumberForId(id)).filter(n => n !== null);

      if (numbers.length > 0) {
        const currentIndex = citationIndex++;
        return `<cite data-citations="${numbers.join(',')}" data-cite-index="${currentIndex}">${numbers.join(',')}</cite>`;
      }
      return match;
    });

    return { 
      content: processedContent, 
      usedSources: usedSources.sort((a, b) => a.number - b.number),
      citationMap 
    };
  };
  const { content, usedSources, citationMap } = processContent();

  const handleCopyMessage = async () => {
    try {
      // Remove citation IDs from content before copying
      const citationRegex = /\[([a-zA-Z0-9\-_,\s]{15,})\]/g;
      const cleanContent = message.content.replace(citationRegex, '');
      
      // Build the copy text with sources if available
      let copyText = cleanContent.trim();
      
      if (usedSources && usedSources.length > 0) {
        copyText += '\n\nSources:';
        usedSources.forEach(({ number, source }) => {
          copyText += `\n\n${number}. ${source.title}`;
          copyText += `\n${source.text}`;
        });
      }
      
      await navigator.clipboard.writeText(copyText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const CitationComponent = ({ dataCitations, dataCiteIndex }) => {
    const numbers = dataCitations.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    const citeIndex = dataCiteIndex || 0;

    return (
      <sup className="inline-flex gap-0.5 ml-0.5 relative">
        {numbers.map((number, idx) => {
          const sourceInfo = citationMap[number];
          const uniqueId = `citation-${citeIndex}-${number}-${idx}`;
          
          return (
            <span key={idx} className="relative inline-block">
              <span 
                className="citation-number inline-flex items-center justify-center w-4 h-4 text-[#18345D] p-2 border border-blue-200 rounded-full cursor-pointer hover:bg-blue-50 transition-colors text-[10px] font-medium"
                onMouseEnter={() => handleCitationMouseEnter(uniqueId)}
                onMouseLeave={handleCitationMouseLeave}
                role="button"
                tabIndex={0}
                aria-label={`Show source ${number}`}
              >
                {number}
              </span>
              {activePopover === uniqueId && sourceInfo && (
                <div 
                  className="citation-popover absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-50 text-xs rounded-md shadow-sm whitespace-nowrap z-50 min-w-max max-w-xs border border-gray-200"
                  style={{
                    opacity: 0,
                    animation: 'fadeInUp 0.2s ease-out forwards'
                  }}
                  onMouseEnter={() => handleCitationMouseEnter(uniqueId)}
                  onMouseLeave={handleCitationMouseLeave}
                >
                  <div className="relative text-gray-700">
                    {sourceInfo.title}
                  </div>
                </div>
              )}
            </span>
          );
        })}
      </sup>
    );
  };

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
            p-2 leading-relaxed 
            ${isUser 
              ? ' text-black ' 
              : 'bg-white text-gray-800'
            }
          `}>
            <div className='mt-3'>
              {!isStreaming && (content.length===0 || content[0]==="")  && "I couldn't find an answer to this within my library of Buddhist texts. Please try rephrasing your question or asking about a different concept."}
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                  cite: ({ node, ...props }) => {
                    return <CitationComponent 
                      dataCitations={props['data-citations']} 
                      dataCiteIndex={props['data-cite-index']}
                    />;
                  }
                }}
              >
                {content}
              </ReactMarkdown>
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

              {!isStreaming && (
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mt-2"
                  aria-label={isCopied ? 'Copied to clipboard' : 'Copy message'}
                  tabIndex={0}
                >
                  {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
          )}

          {!isUser && !isStreaming && (!usedSources || usedSources.length === 0) && message.content && (
            <button
              onClick={handleCopyMessage}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mt-2"
              aria-label={isCopied ? 'Copied to clipboard' : 'Copy message'}
              tabIndex={0}
            >
              {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
