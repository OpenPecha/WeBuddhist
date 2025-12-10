import type { ReactNode } from "react";
import { useCustomEditor } from "../../sheet-utils/CustomEditor";
import { useSlate } from "slate-react";
import { Button } from "@/components/ui/button";

type MarkButtonProps = {
  format: string;
  children: ReactNode;
  className?: string;
  title?: string;
};

const MarkButton = (prop: MarkButtonProps) => {
  const { format, children, className, title } = prop;
  const editor = useSlate();
  const customEditor = useCustomEditor();
  const isActive = customEditor.isMarkActive(editor, format);
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
        customEditor.toggleMark(editor, format);
      }}
    >
      {children}
    </Button>
  );
};

export default MarkButton;
