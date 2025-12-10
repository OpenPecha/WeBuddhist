import type { ReactNode } from "react";
import { useSlate } from "slate-react";
import { useCustomEditor } from "../../sheet-utils/CustomEditor";
import { Button } from "@/components/ui/button";

type BlockButtonProps = {
  format: string;
  children: ReactNode;
  title?: string;
};

const BlockButton = (prop: BlockButtonProps) => {
  const { format, children, title } = prop;
  const editor = useSlate();
  const customEditor = useCustomEditor();
  const isActive = customEditor.isBlockActive(editor, format);
  const buttonClasses =
    `${"w-7 h-7 md:w-8 md:h-8 text-gray-600 text-sm hover:bg-gray-200 hover:text-gray-800 active:bg-gray-300 active:text-black"} ${isActive ? "active bg-gray-300 text-black" : ""}`.trim();

  return (
    <Button
      type="button"
      aria-pressed={isActive}
      variant="ghost"
      size="icon-sm"
      className={buttonClasses}
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        customEditor.toggleBlock(editor, format);
      }}
    >
      {children}
    </Button>
  );
};

export default BlockButton;
