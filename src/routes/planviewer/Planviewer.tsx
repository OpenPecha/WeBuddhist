import { useTolgee } from "@tolgee/react";
import { LANGUAGE } from "../../utils/constants.ts";
import { mapLanguageCode } from "../../utils/helperFunctions.tsx";

const PLAN_VIEWER_URL = "https://plans.webuddhist.com";

const Planviewer = () => {
  const tolgee = useTolgee(["language"]);

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
