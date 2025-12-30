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
                  className="inline-flex items-center justify-center w-4 h-4 text-faded-grey p-2 border rounded-full cursor-pointer text-[10px]"
                >
                  {number}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                sideOffset={5}
                align="start"
                className="max-w-xs"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Source</span>
                  <button
                    type="button"
                    className="cursor-pointer text-sm truncate text-left"
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
