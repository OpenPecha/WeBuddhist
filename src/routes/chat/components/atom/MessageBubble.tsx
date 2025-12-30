import { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaCheck } from "react-icons/fa6";
import { useMutation } from "react-query";
import axiosInstance from "../../../../config/axios-config";
import webuddhistlogo from "@/assets/icons/pecha_icon.png";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { CopyIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const fetchURL = async (id: string) => {
  const { data } = await axiosInstance.get(`/api/v1/search/chat/${id}`);
  return data;
};

interface CitationComponentProps {
  readonly dataCitations: string;
  readonly citationMap: Record<number, any>;
  readonly onSourceClick: (sourceId: string) => void;
}

const CitationComponent = ({
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

interface MessageBubbleProps {
  readonly message: any;
  readonly isStreaming?: boolean;
}

export function MessageBubble({
  message,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [showSources, setShowSources] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const urlMutation = useMutation(fetchURL, {
    onSuccess: (data) => {
      if (data) {
        window.open(data, "_blank", "noopener,noreferrer");
      }
    },
    onError: (error) => {
      console.error("Error fetching URL:", error);
    },
  });

  // Close drawer on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showSources) {
        setShowSources(false);
      }
    };

    if (showSources) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showSources]);

  const handleSourceClick = (sourceId: string) => {
    urlMutation.mutate(sourceId);
  };

  const processContent = () => {
    if (
      isUser ||
      !message.searchResults ||
      message.searchResults.length === 0 ||
      !message.isComplete
    ) {
      return { content: message.content, usedSources: [], citationMap: {} };
    }

    let processedContent = message.content;
    const usedSources: Array<{ number: number; source: any }> = [];
    const idToNumber: Record<string, number> = {};
    const citationMap: Record<number, any> = {};
    let citationCount = 0;

    const getNumberForId = (id: string) => {
      const trimmedId = id.trim();
      if (!trimmedId) return null;
      if (idToNumber[trimmedId]) return idToNumber[trimmedId];

      const source = message.searchResults?.find(
        (s: any) => s.id === trimmedId,
      );
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

    processedContent = processedContent.replaceAll(
      citationRegex,
      (_match: string, idContent: string) => {
        const ids = idContent
          .split(/[,\s]+/)
          .filter((id: string) => id.trim().length > 0);
        const numbers = ids
          .map((id: string) => getNumberForId(id))
          .filter((n: number | null) => n !== null);

        if (numbers.length > 0) {
          const currentIndex = citationIndex++;
          return `<cite data-citations="${numbers.join(",")}" data-cite-index="${currentIndex}">${numbers.join(",")}</cite>`;
        }
        return _match;
      },
    );

    return {
      content: processedContent,
      usedSources: [...usedSources].sort((a, b) => a.number - b.number),
      citationMap,
    };
  };
  const { content, usedSources, citationMap } = processContent();

  const handleCopyMessage = async () => {
    try {
      // Remove citation IDs from content before copying
      const citationRegex = /\[([a-zA-Z0-9\-_,\s]{15,})\]/g;
      const cleanContent = message.content.replaceAll(citationRegex, "");

      // Build the copy text with sources if available
      let copyText = cleanContent.trim();

      if (usedSources && usedSources.length > 0) {
        copyText += "\n\nSources:";
        usedSources.forEach(({ number, source }) => {
          copyText += `\n\n${number}. ${source.title}`;
          copyText += `\n${source.text}`;
        });
      }

      await navigator.clipboard.writeText(copyText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  return (
    <div className={`flex w-full`}>
      <div className={`flex items-center`}>
        {isUser && (
          <div
            className={`
          w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-1
          bg-gray-200 text-gray-600
        `}
          >
            <img src={webuddhistlogo} alt="Webuddhist" className="w-8 h-8" />
          </div>
        )}
        <div className={`flex text-left flex-col min-w-0`}>
          <div
            className={`
            p-2 leading-relaxed 
            ${isUser ? " text-black " : "bg-white text-gray-800"}
          `}
          >
            <div className="mt-3 prose-sm prose-neutral prose-a:text-accent-foreground/50">
              {!isStreaming &&
                (content.length === 0 || content[0] === "") &&
                "I couldn't find an answer to this within my library of Buddhist texts. Please try rephrasing your question or asking about a different concept."}
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                  cite: ({ node, ...props }: any) => {
                    const dataCitations = props["data-citations"];
                    if (!dataCitations) return null;
                    return (
                      <CitationComponent
                        dataCitations={dataCitations}
                        citationMap={citationMap}
                        onSourceClick={handleSourceClick}
                      />
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>

          {!isUser && usedSources && usedSources.length > 0 && (
            <div className=" w-full max-w-md">
              <button
                type="button"
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-2"
              >
                {showSources ? (
                  <FaChevronUp size={14} />
                ) : (
                  <FaChevronDown size={14} />
                )}
                {showSources ? "Hide" : "View"} {usedSources.length} Sources
              </button>

              {showSources && (
                <div className="grid gap-2">
                  {usedSources.map(({ number, source }, index) => (
                    <button
                      type="button"
                      key={number}
                      className="flex border-l border-[#abadb1] flex-col p-2 cursor-pointer hover:bg-gray-50 transition-colors text-left"
                      style={{
                        opacity: 0,
                        animation: "fadeInUp 0.6s ease-out forwards",
                        animationDelay: `${index * 0.1}s`,
                      }}
                      onClick={() => handleSourceClick(source.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="shrink-0 w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold text-[10px]">
                          {number}
                        </span>
                        <span className="font-medium text-gray-700 truncate">
                          {source.title || "Unknown Source"}
                        </span>
                      </div>
                      <div className="text-gray-500 line-clamp-2 pl-6 italic">
                        "{source.text}"
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!isStreaming && (
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="flex items-center p-2 text-gray-500 hover:text-gray-700 transition-colors mt-2"
                >
                  {isCopied ? (
                    <FaCheck size={14} className="text-green-800" />
                  ) : (
                    <CopyIcon className="size-4 cursor-pointer" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
