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

export const checkSectionsForTranslation = (sections) => {
  if (!sections || sections.length === 0) return false;

  for (const section of sections) {
    if (section.segments && section.segments.length > 0) {
      for (const segment of section.segments) {
        if (segment.translation && segment.translation.content) {
          return true;
        }
      }
    }

    if (section.sections && section.sections.length > 0) {
      const hasTranslationInNestedSections = checkSectionsForTranslation(
        section.sections
      );
      if (hasTranslationInNestedSections) return true;
    }
  }

  return false;
};

export const findAndScrollToSegment = (
  targetId,
  setSelectedSegmentId,
  currentChapter
) => {
  if (targetId) {
    setSelectedSegmentId(targetId);
  }

  setTimeout(() => {
    const chapterContainers = document.querySelectorAll(".chapter-container");
    let targetContainer = null;

    if (currentChapter) {
      const chapterId = currentChapter.segmentId || "";

      for (const container of chapterContainers) {
        const containerChapterId = container.getAttribute("data-chapter-id");
        if (
          containerChapterId === chapterId ||
          (chapterId === "" &&
            containerChapterId &&
            containerChapterId.startsWith("chapter-"))
        ) {
          targetContainer = container;
          break;
        }
      }
    }

    if (!targetContainer && chapterContainers.length > 0) {
      targetContainer = chapterContainers[chapterContainers.length - 1];
    }

    // Scenario 1: Looking for a segment
    if (targetId) {
      const segmentElement = targetContainer
        ? targetContainer.querySelector(`[data-segment-id="${targetId}"]`)
        : document.querySelector(`[data-segment-id="${targetId}"]`);

      if (segmentElement) {
        const parentSection = segmentElement.closest(".nested-section");
        if (parentSection) {
          parentSection.scrollIntoView({ behavior: "smooth", block: "start" });
          segmentElement.classList.add("highlighted-segment");
        } else {
          segmentElement.scrollIntoView({ behavior: "smooth", block: "start" });
          segmentElement.classList.add("highlighted-segment");
        }
        return;
      }
    }

    // Scenario 2: Looking for a section
    if (currentChapter && currentChapter.sectionId) {
      const sectionElement = targetContainer
        ? targetContainer.querySelector(
            `[data-section-id="${currentChapter.sectionId}"]`
          )
        : document.querySelector(
            `[data-section-id="${currentChapter.sectionId}"]`
          );

      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
        sectionElement.classList.add("highlighted-segment");
        return;
      }
    }
  }, 500);
};
