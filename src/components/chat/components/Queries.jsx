import { Search } from 'lucide-react';

export function Queries({ queries }) {
  if (!queries) return null;

  // Extract unique query values
  const uniqueQueries = [...new Set(Object.values(queries))].filter(
    (q) => q && q.trim()
  );

  if (uniqueQueries.length === 0) return null;

  return (
    <div className="w-full mb-4">
      <div className="flex flex-wrap gap-2">
        {uniqueQueries.map((query, index) => (
          <div
            key={index}
            style={{
              opacity: 0,
              animation: 'fadeInUp 0.6s ease-out forwards',
              animationDelay: `${index * 0.1}s`
            }}
            className="flex items-center gap-2 px-3 py-2 bg-[#E5F3FE] border-blue-200 rounded text-sm text-[#00457D]"
          >
            <Search size={14} className="shrink-0" />
            <span className="font-medium text-left">{query}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

