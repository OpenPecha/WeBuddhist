export const getEarlyReturn = ({ isLoading, error, t }) => {
  if (isLoading) {
    return <div className="notfound listtitle">{t("common.loading")}</div>;
  }

  if (error) {
    return (
      <div className="notfound">
        <div className="no-content">{t("text_category.message.notfound")}</div>
      </div>
    );
  }

  return null;
};
export const mapLanguageCode = (languageCode) => {
  return languageCode === "bo-IN" ? "bo" : languageCode;
};
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
      return;
    }

    const scrollContainer = targetContainer.querySelector(
      ".tibetan-text-container"
    );
    if (!scrollContainer) {
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
    }
  }, 300);
};
export const getFirstSegmentId = (sections) => {
  if (!sections || sections.length === 0) return null;
  const firstSection = sections[0];
  if (!firstSection) return null;
  // Check nested sections first (recursive)
  if (firstSection.sections && firstSection.sections.length > 0) {
    const nestedFirst = getFirstSegmentId(firstSection.sections);
    if (nestedFirst) return nestedFirst;
  }
  // Then check segments
  if (firstSection.segments && firstSection.segments.length > 0) {
    return firstSection.segments[0].segment_id;
  }
  return null;
};
export const getLastSegmentId = (sections) => {
  if (!sections || sections.length === 0) return null;
  const lastSection = sections[sections.length - 1];
  if (!lastSection) return null;
  // Check nested sections first (recursive)
  if (lastSection.sections && lastSection.sections.length > 0) {
    const nestedLast = getLastSegmentId(lastSection.sections);
    if (nestedLast) return nestedLast;
  }
  // Then check segments
  if (lastSection.segments && lastSection.segments.length > 0) {
    return lastSection.segments[lastSection.segments.length - 1].segment_id;
  }
  return null;
};

export const mergeSections = (existingSections, newSections) => {
  if (!existingSections || existingSections.length === 0) return newSections;
  if (!newSections || newSections.length === 0) return existingSections;

  const mergedSections = [...existingSections];
  newSections.forEach(newSection => {
    const existingIndex = mergedSections.findIndex(section => section.id === newSection.id);
    if (existingIndex !== -1) {
      const existingSection = mergedSections[existingIndex];
      // Merge segments
      const mergedSegments = [...(existingSection.segments || [])];
      (newSection.segments || []).forEach(newSegment => {
        if (!mergedSegments.some(segment => segment.segment_id === newSegment.segment_id)) {
          mergedSegments.push(newSegment);
        }
      });
      // Merge nested sections recursively
      const mergedNestedSections = mergeSections(existingSection.sections || [], newSection.sections || []);
      mergedSections[existingIndex] = {
        ...existingSection,
        segments: mergedSegments,
        sections: mergedNestedSections
      };
    } else {
      mergedSections.push(newSection);
    }
  });
  return mergedSections;
};