import { useState } from "react";
import { FiShare2 } from "react-icons/fi";
import { FaFacebook } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { IoCopy } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import axiosInstance from "@/config/axios-config.ts";

type ShortUrlResponse = {
  shortUrl: string;
};

export const fetchShortUrl = async (
  url: string,
  textId: string,
): Promise<ShortUrlResponse> => {
  const { data } = await axiosInstance.post("/api/v1/share", {
    text_id: textId,
    language: "bo",
    url,
  });
  return data;
};

const SheetShare = () => {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { sheetSlugAndId } = useParams<{ sheetSlugAndId?: string }>();
  const textId = sheetSlugAndId?.split("_").pop() ?? "";

  const { data: shorturlData, isLoading } = useQuery(
    ["shortUrl", url, textId, isOpen],
    () => fetchShortUrl(url, textId),
    {
      refetchOnWindowFocus: false,
      enabled: isOpen && Boolean(textId),
      retry: false,
    },
  );

  const handleCopy = () => {
    const shareUrl = shorturlData?.shortUrl || url;
    if (!shareUrl || !navigator?.clipboard) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareUrl = shorturlData?.shortUrl || url;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center py-2 rounded hover:bg-accent transition-colors"
          aria-label="Change language"
        >
          <FiShare2 className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <a
            className="flex w-full items-center gap-2"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook className="text-blue-600" />
            <span>Share on Facebook</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            className="flex w-full items-center gap-2"
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaSquareXTwitter />
            <span>Share on X</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleCopy}
          disabled={isLoading || !shareUrl}
          className="flex items-center gap-2"
        >
          {copied ? (
            <IoMdCheckmark className="text-green-600" size={16} />
          ) : (
            <IoCopy size={16} />
          )}
          <span>
            {isLoading ? "Loading..." : copied ? "Copied!" : "Copy link"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SheetShare;
