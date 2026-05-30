import { useTolgee } from "@tolgee/react";
import { LANGUAGE } from "../../utils/constants.ts";
import { mapLanguageCode } from "../../utils/helperFunctions.tsx";

const PLAN_VIEWER_URL = import.meta.env.VITE_WEBUDDHIST_PLAN_VIEWER_URL as
  | string
  | undefined;

const Planviewer = () => {
  const tolgee = useTolgee(["language"]);

  if (!PLAN_VIEWER_URL) {
    return (
      <p className="flex h-dvh-nav w-full items-center justify-center text-muted-foreground">
        Plan viewer is not configured.
      </p>
    );
  }

  const storedLanguage =
    tolgee.getLanguage() || localStorage.getItem(LANGUAGE) || "en";
  const language = mapLanguageCode(storedLanguage);
  const planViewerSrc = new URL(PLAN_VIEWER_URL);
  planViewerSrc.searchParams.set("lang", language);

  return (
    <iframe
      src={planViewerSrc.toString()}
      title="WeBuddhist plan viewer"
      className="block h-dvh w-full border-0"
    />
  );
};

export default Planviewer;
