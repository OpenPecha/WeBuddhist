import { useState, useEffect } from 'react';
import { User, Bot, ChevronDown, ChevronUp, X } from 'lucide-react';
import webuddhistlogo from "../../../assets/icons/pecha_icon.png";

export function MessageBubble({ message, isStreaming = false }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showSources) {
        setShowSources(false);
      }
    };
    
    if (showSources) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showSources]);

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
          <sup key={offset} className="inline-flex gap-0.5 ml-0.5">
            {numbers.map((num, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center justify-center w-4 h-4 text-[#18345D] p-2 border border-red-200 rounded-full cursor-pointer"
                title={usedSources.find(s => s.number === num)?.source.title}
              >
                {num}
              </span>
            ))}
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
            p-3 text-sm leading-relaxed 
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
                      className="flex border-l border-[#abadb1] flex-col p-2 text-sm"
                      style={{
                        opacity: 0,
                        animation: 'fadeInUp 0.6s ease-out forwards',
                        animationDelay: `${index * 0.1}s`
                      }}
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
