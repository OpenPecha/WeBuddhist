import { useState } from 'react';
import { ChevronUp } from 'lucide-react';


export function SearchResults({ results }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!results || results.length === 0) return null;

  const visibleResults = isExpanded ? results : results.slice(0, 4);
  const hiddenCount = results.length - 4;

  return (
    <div className=" mx-auto w-full">
      <div className="flex flex-wrap gap-2">
        {visibleResults.map((result, index) => (
          <span
            key={index}
            className="flex flex-col w-40 h-24 p-2 bg-white border border-gray-200 rounded-lg no-underline group overflow-hidden"
          >
            <div className="flex items-center gap-1 mb-1 ">
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-[#18345D] shrink-0">
                {index + 1}
              </div>
              <span className=" text-sm font-semibold  truncate text-[#18345D]">
                {result.title || 'Unknown Source'}
              </span>
            </div>
            <p className=" text-sm text-gray-500 truncate">
              {result.text}
            </p>
          </span>
        ))}
        
        {!isExpanded && hiddenCount > 0 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex flex-col w-12 h-24 items-center justify-center bg-gray-50 border hover:bg-gray-100 border-dashed border-gray-300 rounded-lg transition-colors text-gray-500"
          >
            <span className="text-sm font-bold">+{hiddenCount}</span>
            <span className="text-xs">more</span>
          </button>
        )}
      </div>
      
      {isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="mt-2 text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <ChevronUp size={12} /> Show less
        </button>
      )}
    </div>
  );
}
