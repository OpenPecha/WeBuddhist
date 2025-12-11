import { Pen } from "lucide-react";

export function WritingIndicator() {
  return (
    <div className="flex items-center gap-2 text-gray-400 text-sm animate-in fade-in duration-300">
      <div className="relative">
        <Pen size={16} className="animate-bounce" />
      </div>
      <span>Writing..</span>
    </div>
  );
}
