import { useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { useMutation } from "react-query";
import axiosInstance from "../../../../config/axios-config";
import webuddhistlogo from "@/assets/icons/pecha_icon.png";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { CopyIcon } from "@radix-ui/react-icons";
import { CitationComponent } from "./Citation";
import { processContent } from "../../services/processContent";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export const fetchURL = async (id: string) => {
  const { data } = await axiosInstance.get(`/api/v1/search/chat/${id}`);
  return data;
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
  const [showSourcesSheet, setShowSourcesSheet] = useState(false);
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

  const handleSourceClick = (sourceId: string) => {
    urlMutation.mutate(sourceId);
  };

  const { content, usedSources, citationMap } = processContent({
    message,
    isUser,
  });

  const handleCopyMessage = async () => {
    try {
      const citationRegex = /\[([a-zA-Z0-9\-_,\s]{15,})\]/g;
      const cleanContent = message.content.replaceAll(citationRegex, "");
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
    <div className="flex w-full">
      <div className="flex items-center">
        {isUser && (
          <div
            className="
            w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-1
            bg-gray-200 text-gray-600
        "
          >
            <img src={webuddhistlogo} alt="Webuddhist" className="w-8 h-8" />
          </div>
        )}
        <div className="flex text-left flex-col min-w-0">
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
            <div className="w-full flex px-2 gap-x-2 items-center max-w-md">
              {!isStreaming && (
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="flex items-center  text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {isCopied ? (
                    <FaCheck size={14} className="text-green-800" />
                  ) : (
                    <CopyIcon className="size-4 cursor-pointer" />
                  )}
                </button>
              )}
              <Button
                type="button"
                variant="ghost"
                className=" text-faded-grey  text-xs p-1 cursor-pointer"
                onClick={() => setShowSourcesSheet(true)}
              >
                {usedSources.length} Sources
              </Button>
            </div>
          )}
        </div>
      </div>

      <Sheet open={showSourcesSheet} onOpenChange={setShowSourcesSheet}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Sources ({usedSources?.length || 0})</SheetTitle>
            <SheetDescription>
              References from Buddhist texts used in this response
            </SheetDescription>
          </SheetHeader>

          <div>
            {usedSources?.map(({ number, source }) => (
              <button
                type="button"
                key={number}
                className="flex  flex-col overalltext p-3 cursor-pointer w-full transition-colors text-left hover:bg-gray-50"
                onClick={() => handleSourceClick(source.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs">
                    {number}
                  </span>
                  <span className="font-medium content">{source.title}</span>
                </div>
                <div className=" text-faded-grey content text-sm pl-8 leading-relaxed">
                  "{source.text}"
                </div>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
