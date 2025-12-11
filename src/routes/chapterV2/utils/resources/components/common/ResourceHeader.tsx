import { IoChevronBackSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/button";

type ResourceHeaderProps = {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  className?: string;
};

const ResourceHeader = ({
  title,
  onClose,
  onBack,
  className = "",
}: ResourceHeaderProps) => (
  <div
    className={`sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-[#e0e0e0] bg-[#EDEDED] px-3 py-4 ${className}`}
  >
    <div className="flex items-center gap-2">
      {onBack && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer"
          onClick={onBack}
        >
          <IoChevronBackSharp size={20} />
        </Button>
      )}
      <p className="text-base font-medium text-gray-800">{title}</p>
    </div>
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="cursor-pointer"
      onClick={onClose}
    >
      <IoMdClose size={20} />
    </Button>
  </div>
);

export default ResourceHeader;
