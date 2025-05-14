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
    if (!currentChapter) return;

    const targetContainer = document.querySelector(
      `[data-chapter-id="${currentChapter.uniqueId}"]`
    );

    if (!targetContainer) return;

    // Scenario 1: Scroll to segment
    if (targetId) {
      const segmentElement = targetContainer.querySelector(
        `[data-segment-id="${targetId}"]`
      );

      if (segmentElement) {
        const scrollContainer = targetContainer.querySelector(
          ".tibetan-text-container"
        );
        if (scrollContainer) {
          const elementTop =
            segmentElement.offsetTop - scrollContainer.offsetTop;
          scrollContainer.scrollTo({
            top: elementTop - 50,
            behavior: "smooth",
          });
        }
        segmentElement.classList.add("highlighted-segment");
        return;
      }
    }

    // Scenario 2: Scroll to section
    if (currentChapter.sectionId) {
      const sectionElement = targetContainer.querySelector(
        `[data-section-id="${currentChapter.sectionId}"]`
      );

      if (sectionElement) {
        const scrollContainer = targetContainer.querySelector(
          ".tibetan-text-container"
        );
        if (scrollContainer) {
          const elementTop =
            sectionElement.offsetTop - scrollContainer.offsetTop;
          scrollContainer.scrollTo({
            top: elementTop - 50,
            behavior: "smooth",
          });
        }
        sectionElement.classList.add("highlighted-segment");
      }
    }
  }, 500);
};

export const findAndScrollToSection = (sectionId, currentChapter) => {
  if (!sectionId || !currentChapter) return;

  setTimeout(() => {
    const targetContainer = document.querySelector(
      `[data-chapter-id="${currentChapter.uniqueId}"]`
    );

    if (!targetContainer) {
      console.log("Target container not found");
      return;
    }

    const scrollContainer = targetContainer.querySelector(
      ".tibetan-text-container"
    );
    if (!scrollContainer) {
      console.log("Scroll container not found");
      return;
    }

    let sectionElement = targetContainer.querySelector(`#section-${sectionId}`);

    if (!sectionElement) {
      const sectionElements = targetContainer.querySelectorAll(
        `[data-section-id="${sectionId}"]`
      );
      if (sectionElements && sectionElements.length > 0) {
        sectionElement = sectionElements[0];
      }
    }

    if (sectionElement) {
      const elementRect = sectionElement.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const relativeTop =
        elementRect.top - containerRect.top + scrollContainer.scrollTop;

      scrollContainer.scrollTo({
        top: relativeTop - 50,
        behavior: "smooth",
      });

      console.log("Successfully scrolled to section:", sectionId);
    } else {
      console.log("Section element not found with ID:", sectionId);
    }
  }, 300);
};
