import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CitationComponentProps {
  readonly dataCitations: string;
  readonly citationMap: Record<number, any>;
  readonly onSourceClick: (sourceId: string) => void;
}

export const CitationComponent = ({
  dataCitations,
  citationMap,
  onSourceClick,
}: CitationComponentProps) => {
  const numbers = dataCitations
    .split(",")
    .map((n: string) => Number.parseInt(n.trim()))
    .filter((n: number) => !Number.isNaN(n));

  return (
    <sup className="inline-flex gap-0.5 ml-0.5">
      {numbers.map((number: number) => {
        const sourceInfo = citationMap[number];

        if (!sourceInfo) return null;

        return (
          <TooltipProvider key={number} delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="citation-number inline-flex items-center justify-center w-4 h-4 text-[#18345D] p-2 border border-blue-200 rounded-full cursor-pointer hover:bg-blue-50 transition-colors text-[10px] font-medium"
                  aria-label={`Show source ${number}`}
                >
                  {number}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs bg-gray-50 border-gray-200"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 text-xs">Source</span>
                  <button
                    type="button"
                    className="text-gray-700 cursor-pointer hover:text-black transition-colors text-sm font-medium truncate text-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSourceClick(sourceInfo.id);
                    }}
                  >
                    {sourceInfo.title}
                  </button>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </sup>
  );
};
