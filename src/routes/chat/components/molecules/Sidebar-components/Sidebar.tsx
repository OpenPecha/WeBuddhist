import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { BsTrash } from "react-icons/bs";
import { IoCreateOutline } from "react-icons/io5";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FaEllipsis } from "react-icons/fa6";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoryIcon } from "@/utils/Icon.tsx";
import { SidebarUser } from "./SidebarUser.tsx";
import smallimage from "@/assets/icons/pecha_icon.png";
import { CiLocationArrow1 } from "react-icons/ci";
import { useThreads } from "../../../hooks/useThreads";
import { useChat } from "../../../context/ChatContext";
import { useTranslate } from "@tolgee/react";

export function ChatSidebar() {
  const navigate = useNavigate();
  const { threadId, resetChat } = useChat();
  const { t } = useTranslate();

  const {
    threads,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    deleteThread,
    isDeleting,
  } = useThreads();

  const { ref: sentinelRef, inView: isBottomSentinelVisible } = useInView({
    threshold: 0.1,
    rootMargin: "50px",
  });

  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (isBottomSentinelVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isBottomSentinelVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleThreadClick = (clickedThreadId: string) => {
    navigate(`/ai/${clickedThreadId}`);
  };

  const handleNewChat = () => {
    resetChat();
    navigate("/ai/new");
  };

  const handleDeleteClick = (id: string) => {
    setThreadToDelete(id);
  };

  const confirmDelete = () => {
    if (threadToDelete) {
      deleteThread(threadToDelete);

      if (threadToDelete === threadId) {
        resetChat();
        navigate("/ai/new");
      }

      setThreadToDelete(null);
    }
  };

  const renderScrollSentinel = () => {
    if (!hasNextPage || isFetchingNextPage) return null;
    return (
      <div
        ref={sentinelRef}
        className="h-5 w-full opacity-0 pointer-events-none"
      />
    );
  };

  const renderThreadList = () => {
    if (isLoading) {
      return (
        <div className="text-center text-faded-grey text-sm p-2 group-data-[collapsible=icon]:hidden">
          Loading...
        </div>
      );
    }

    if (threads.length === 0) {
      return (
        <div className="text-center text-faded-grey text-sm group-data-[collapsible=icon]:hidden">
          No chats yet
        </div>
      );
    }

    return (
      <>
        {threads.map((thread) => (
          <SidebarMenuItem
            key={thread.id}
            className="group-data-[collapsible=icon]:hidden"
          >
            <SidebarMenuButton
              onClick={() => handleThreadClick(thread.id)}
              isActive={threadId === thread.id}
              className={`w-full justify-start ${
                threadId === thread.id ? "text-primary" : "text-faded-grey"
              }`}
            >
              <span className="truncate pr-5">{thread.title}</span>
            </SidebarMenuButton>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="cursor-pointer outline-none absolute top-1.5 right-1 opacity-0 group-hover/menu-item:opacity-100 focus:opacity-100 group-data-[collapsible=icon]:hidden"
                asChild
              >
                <button
                  aria-label="More options"
                  className="flex aspect-square w-5 items-center justify-center rounded-md hover:bg-sidebar-accent"
                >
                  <FaEllipsis size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end">
                <DropdownMenuItem onClick={() => handleDeleteClick(thread.id)}>
                  <BsTrash size={14} />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}

        {isFetchingNextPage && (
          <div className="space-y-2 p-2 group-data-[collapsible=icon]:hidden">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        )}

        {renderScrollSentinel()}
      </>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-right">
      <SidebarHeader className="flex items-center py-4 px-2 justify-between group-data-[collapsible=icon]:flex-col">
        <Link
          to="/"
          className="flex items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full"
          aria-label="Home"
        >
          <img className="h-[30px]" src={smallimage} alt="Webuddhist" />
        </Link>
        <SidebarTrigger className="group-data-[collapsible=icon]" />
      </SidebarHeader>
      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleNewChat}
                  className="text-faded-grey"
                  tooltip="New Chat"
                >
                  <IoCreateOutline size={18} />
                  <span>New Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="flex-1 min-h-0 flex flex-col">
          <SidebarGroupLabel className="text-sm flex items-center gap-2 shrink-0">
            <HistoryIcon /> History
          </SidebarGroupLabel>
          <SidebarGroupContent className="min-h-0 flex-1 overflow-y-auto w-full">
            <SidebarMenu>{renderThreadList()}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Link to="/">
        <div className="text-center bg-background group/nav-button p-2 flex items-center border rounded-sm m-2 justify-center gap-2 text-faded-grey text-sm group-data-[collapsible=icon]:hidden">
          <CiLocationArrow1
            size={16}
            className="cursor-pointer group-hover/nav-button:rotate-45 transition-transform duration-300"
            onClick={() => navigate("/")}
          />
          Navigate back to homepage
        </div>
      </Link>
      <SidebarSeparator />

      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>

      <AlertDialog
        open={!!threadToDelete}
        onOpenChange={(open) => !open && setThreadToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("chat.delete_header")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("chat.delete_warning_message")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
