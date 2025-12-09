import React from "react";
import clsx from "clsx";

type TwoColumnLayoutProps = {
  main: React.ReactNode;
  sidebar: React.ReactNode;
  containerClassName?: string;
  innerClassName?: string;
  mainClassName?: string;
  sidebarClassName?: string;
  stackOrder?: "main-first" | "sidebar-first";
};

const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  main,
  sidebar,
  containerClassName,
  innerClassName,
  mainClassName,
  sidebarClassName,
  stackOrder = "main-first",
}) => {
  const stackDirectionClass =
    stackOrder === "sidebar-first"
      ? "flex-col-reverse md:flex-row"
      : "flex-col md:flex-row";

  return (
    <div
      className={clsx(
        "flex min-h-screen",
        stackDirectionClass,
        containerClassName,
      )}
    >
      <div className={clsx("flex w-full", stackDirectionClass, innerClassName)}>
        <div className={clsx("flex-3 w-full p-4", mainClassName)}>{main}</div>
        <div
          className={clsx(
            "flex-1 w-full border-[#F0F0EF] bg-[#F6F6F6] p-6 md:border-l md:p-10",
            sidebarClassName,
          )}
        >
          {sidebar}
        </div>
      </div>
    </div>
  );
};

export default TwoColumnLayout;
