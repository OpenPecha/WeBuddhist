import { useState } from 'react';
import { ChevronUp } from 'lucide-react';


export function SearchResults({ results }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!results || results.length === 0) return null;

  const visibleResults = isExpanded ? results : results.slice(0, 3);
  const hiddenCount = results.length - 3;

  return (
    <div className="mb-4 w-full">
      <div className="flex flex-wrap gap-2">
        {visibleResults.map((result, index) => (
          <a
            key={index}
            href={result.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col w-40 h-24 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow no-underline group overflow-hidden relative"
          >
            <div className="flex items-center gap-1 mb-1">
              <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-300 shrink-0">
                {index + 1}
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {result.title || 'Unknown Source'}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-3 leading-tight">
              {result.text}
            </p>
          </a>
        ))}
        
        {!isExpanded && hiddenCount > 0 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex flex-col w-24 h-24 items-center justify-center bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
          >
            <span className="text-sm font-bold">+{hiddenCount}</span>
            <span className="text-xs">more</span>
          </button>
        )}
      </div>
      
      {isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="mt-2 text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronUp size={12} /> Show less
        </button>
      )}
    </div>
  );
}
