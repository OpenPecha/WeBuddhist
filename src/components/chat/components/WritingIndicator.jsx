import { Pen } from 'lucide-react';

export function WritingIndicator() {
  return (
    <div className="flex items-center gap-2 text-gray-400 text-sm p-4 animate-in fade-in duration-300">
      <div className="relative">
        <Pen size={16} className="animate-bounce" />
        <div className="absolute -bottom-1 -right-1 w-1 h-1 bg-gray-400 rounded-full animate-ping" />
      </div>
      <span>Writing...</span>
    </div>
  );
}
