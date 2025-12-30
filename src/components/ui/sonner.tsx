import {
  FaCircleCheck,
  FaInfo,
  FaAngleLeft,
  FaAngleUp,
  FaAngleDown,
} from "react-icons/fa6";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <FaCircleCheck className="size-4" />,
        info: <FaInfo className="size-4" />,
        warning: <FaAngleLeft className="size-4" />,
        error: <FaAngleUp className="size-4" />,
        loading: <FaAngleDown className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
