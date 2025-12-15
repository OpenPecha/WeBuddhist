import React from "react";
import clsx from "clsx";

import { Badge } from "@/components/ui/badge";
import webuddhist_logo from "/img/webuddhist_logo.svg";

type AuthTwoColumnLayoutProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  badgeText?: string;
  features?: string[];
  containerClassName?: string;
  sidebarClassName?: string;
  mainClassName?: string;
};

const defaultFeatures = [
  "OpenSource",
  "AI Chat",
  "Community Discussion",
  "Simplified Text Relation",
  "Multi Language Support",
];

const AuthTwoColumnLayout: React.FC<AuthTwoColumnLayoutProps> = ({
  children,
  title = "WeBuddhist Study Platform",
  description = "The largest free library of Buddhist texts available to read online in Tibetan, English and Chinese including Sutras, Tantras, Abhidharma, Vinaya, commentaries and more.",
  badgeText = "Buddhism in your own words",
  features = defaultFeatures,
  containerClassName,
  sidebarClassName,
  mainClassName,
}) => {
  return (
    <div
      className={clsx(
        "flex h-dvh w-full items-center justify-center bg-[#FAFAF9]",
        containerClassName,
      )}
    >
      <div className="flex h-full w-full flex-col md:flex-row">
        <aside
          className={clsx(
            "hidden w-full flex-1 flex-col justify-between space-y-6 px-8 py-10 md:flex",
            sidebarClassName,
          )}
        >
          <div className="flex items-start">
            <img
              src={webuddhist_logo}
              alt="WeBuddhist"
              className="h-fit w-40"
            />
          </div>
          <div className="flex w-full flex-col space-y-2 text-start">
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-medium en-serif-text">{title}</p>
              <Badge
                variant="outline"
                className="text-sm text-muted-foreground"
              >
                {badgeText}
              </Badge>
            </div>
            <div className="flex w-full max-w-xl">
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 text-muted-foreground">
            {features.map((feature, index) => (
              <span key={feature} className="flex items-center">
                <p className="text-sm text-muted-foreground">{feature}</p>
                {index < features.length - 1 && (
                  <span
                    className="mx-2 text-muted-foreground"
                    aria-hidden="true"
                  >
                    •
                  </span>
                )}
              </span>
            ))}
          </div>
        </aside>
        <main
          className={clsx(
            "flex w-full flex-1 items-center justify-center bg-white px-6 py-10 md:bg-[#F6F6F6] md:px-10",
            mainClassName,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthTwoColumnLayout;
