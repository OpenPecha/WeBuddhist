import React from 'react';

export const getFirstSegmentId = (sections) => {
  if (!sections?.length) {
    return null;
  }
  const [firstSection] = sections;
  return (
    getFirstSegmentId(firstSection.sections) ?? firstSection.segments?.[0]?.segment_id ?? null
  );
};

export const getLastSegmentId = (sections) => {
  if (!sections?.length) {
    return null;
  }
  const lastSection = sections.at(-1);
  return (
    getLastSegmentId(lastSection.sections) ?? lastSection.segments?.at(-1)?.segment_id ?? null
  );
};

export const getEarlyReturn = ({ isLoading, error, t }) => {
  if (isLoading) {
    return <div className="search-message">{t("common.loading")}</div>;
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
  const languageMap={
    "zh-Hans-CN": "zh",
    "bo-IN": "bo",
  }
  return languageMap[languageCode]
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

export const getCurrentSectionFromScroll = (sections, containerRect, sectionRefs) => {
  if (!sections || sections.length === 0) return null;

  const flatSections = [];
  const walk = (secs, depth = 0) => {
    secs.forEach((sec) => {
      flatSections.push({ sec, depth });
      if (sec.sections && sec.sections.length > 0) {
        walk(sec.sections, depth + 1);
      }
    });
  };
  walk(sections);

  let candidateBelow = { id: null, dist: Infinity, depth: -1 };
  let candidateAbove = { id: null, dist: Infinity, depth: -1 };

  flatSections.forEach(({ sec, depth }) => {
    const element = sectionRefs.current?.get(sec.id);
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (rect.bottom <= containerRect.top || rect.top >= containerRect.bottom) return;
    const offsetFromTop = rect.top - containerRect.top; 
    if (offsetFromTop >= 0) {
      const isCloser = offsetFromTop < candidateBelow.dist;
      const isSameDistButDeeper = offsetFromTop === candidateBelow.dist && depth > candidateBelow.depth;
      if (isCloser || isSameDistButDeeper) {
        candidateBelow = { id: sec.id, dist: offsetFromTop, depth };
      }
    } else {
      const distance = Math.abs(offsetFromTop);
      const isCloser = distance < candidateAbove.dist;
      const isSameDistButDeeper = distance === candidateAbove.dist && depth > candidateAbove.depth;
      if (isCloser || isSameDistButDeeper) {
        candidateAbove = { id: sec.id, dist: distance, depth };
      }
    }
  });
  return candidateBelow.id ?? candidateAbove.id;
};

export const useDynamicTabTitle = (title) => {
  React.useEffect(() => {
    if (title) {
      document.title = title + " | " + "Webuddhist";
    }
    return () => {
      document.title = "Webuddhist - Buddhism in your own words";
    };
  }, [title]);
};
