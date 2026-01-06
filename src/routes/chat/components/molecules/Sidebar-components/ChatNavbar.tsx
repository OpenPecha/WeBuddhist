import clsx from "clsx";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";

const ChatNavbar = ({ className }: { className?: string }) => {
  return (
    <div
      className={clsx(
        "sticky top-0 z-50 h-[60px] w-full",
        "flex items-center justify-between px-4",
        "bg-background",
        className,
      )}
    >
      <SidebarTrigger className="md:hidden" />
      <div className="text-sm flex hover:bg-accent/70 p-2 rounded-md transition-all duration-300  items-center gap-x-2">
        <p className="font-medium flex items-center">
          WEBUDDHIST
          <div className="w-1 h-1 bg-faded-grey rounded-full mx-1" />
          <span className=" text-faded-grey ">RAG</span>
        </p>
        <Badge variant="outline" className="text-faded-grey">
          1.0.0
        </Badge>
      </div>
    </div>
  );
};

export default ChatNavbar;
