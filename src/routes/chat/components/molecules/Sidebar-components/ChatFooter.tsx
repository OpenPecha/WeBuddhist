import { PiWarningCircle } from "react-icons/pi";

const ChatFooter = () => {
  return (
    <div className="text-faded-grey w-full flex items-center text-center text-xs md:text-sm py-2 justify-center bg-background">
      <PiWarningCircle size={16} className="mr-2 hidden md:block" />
      Output may contain errors. Verify important information using additional
      sources.
    </div>
  );
};

export default ChatFooter;
