import React from "react";
import clsx from "clsx";

type TwoColumnLayoutProps = {
  main: React.ReactNode;
  sidebar: React.ReactNode;
  containerClassName?: string;
  innerClassName?: string;
  mainClassName?: string;
  sidebarClassName?: string;
};

const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  main,
  sidebar,
  containerClassName,
  innerClassName,
  mainClassName,
  sidebarClassName,
}) => {
  return (
    <div
      className={clsx(
        "flex min-h-screen flex-col md:flex-row",
        containerClassName
      )}
    >
      <div className={clsx("flex w-full flex-col md:flex-row", innerClassName)}>
        <div className={clsx("flex-3 w-full p-4", mainClassName)}>{main}</div>
        <div
          className={clsx(
            "flex-1 w-full border-[#F0F0EF] bg-[#FBFBFA] p-6 md:border-l md:p-10",
            sidebarClassName
          )}
        >
          {sidebar}
        </div>
      </div>
    </div>
  );
};

export default TwoColumnLayout;
