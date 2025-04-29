import {
  BsFileEarmarkPlus,
  BsFileDiff,
  BsStickies,
  BsShare,
} from "react-icons/bs";

export const LOGGED_IN_VIA = "loggedInVia";
export const REFRESH_TOKEN = "refreshToken";
export const ACCESS_TOKEN = "accessToken";
export const RESET_PASSWORD_TOKEN = "resetPasswordToken";
export const RESET_PASSWORD = "reset-password";
export const LANGUAGE = "language";
export const mapLanguageCode = (languageCode) => {
  return languageCode === "bo-IN" ? "bo" : languageCode;
};

export const menuItems = [
  {
    label: "connection_panel.tools",
    isHeader: true,
  },
  {
    icon: BsFileEarmarkPlus,
    label: "sheet.add_to_sheet",
    isHeader: false,
  },
  {
    icon: BsFileDiff,
    label: "connection_panel.compare_text",
    isHeader: false,
  },
  {
    icon: BsStickies,
    label: "connection_panel.notes",
    isHeader: false,
  },
  {
    icon: BsShare,
    label: "common.share",
    isHeader: false,
  },
];

export const getLanguageClass = (language) => {
  switch (language) {
    case "bo":
      return "bo-text";
    case "en":
      return "en-text";
    case "sa":
      return "bo-text";
    case "bhu":
      return "bo-text";
    default:
      return "overalltext";
  }
};

export const sourceTranslationOptionsMapper = {
  source: "SOURCE",
  translation: "TRANSLATION",
  source_translation: "SOURCE_TRANSLATION",
};

export const findAndScrollToSegment = (
  targetId,
  setSelectedSegmentId,
  currentChapter
) => {
  setSelectedSegmentId(targetId);

  setTimeout(() => {
    const chapterContainers = document.querySelectorAll(".chapter-container");
    let targetContainer = null;

    for (let i = 0; i < chapterContainers.length; i++) {
      const container = chapterContainers[i];
      if (
        container.getAttribute("data-chapter-id") === currentChapter.segmentId
      ) {
        targetContainer = container;
        break;
      }
    }

    if (!targetContainer && chapterContainers.length > 0) {
      targetContainer = chapterContainers[chapterContainers.length - 1];
    }

    const segmentElement = targetContainer
      ? targetContainer.querySelector(`[data-segment-id="${targetId}"]`)
      : document.querySelector(`[data-segment-id="${targetId}"]`);

    if (segmentElement) {
      segmentElement.scrollIntoView({ behavior: "smooth", block: "start" });
      segmentElement.classList.add("highlighted-segment");
    }
  }, 500);
};
