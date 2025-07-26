import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../../config/axios-config.js";
import { useQueryClient } from "react-query";

export const useSectionHierarchy = () => {
  const [sectionHierarchyState, setSectionHierarchyState] = useState({});

  const toggleSection = (sectionId) => {
    setSectionHierarchyState((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return { sectionHierarchyState, setSectionHierarchyState, toggleSection };
};

export const useActiveSection = (activeSectionId, tocData, sectionHierarchyState, setSectionHierarchyState) => {
  useEffect(() => {
    if (!activeSectionId || !tocData?.contents) return;
    
    const expandParentSections = (sections, targetId, parentPath = []) => {
      for (const section of sections || []) {
        if (section.id === targetId) {
          let needsUpdate = false;
          const newState = {...sectionHierarchyState};
          
          parentPath.forEach(parentId => {
            if (!sectionHierarchyState[parentId]) {
              newState[parentId] = true;
              needsUpdate = true;
            }
          });
          
          if (needsUpdate) {
            setSectionHierarchyState(newState);
          }
          return true;
        }
        
        if (section.sections && section.sections.length > 0) {
          const found = expandParentSections(
            section.sections, 
            targetId, 
            [...parentPath, section.id]
          );
          if (found) return true;
        }
      }
      return false;
    };
    
    tocData.contents.forEach(content => {
      if (content.sections) {
        content.sections.forEach(section => {
          expandParentSections([section], activeSectionId);
        });
      }
    });
  }, [activeSectionId, tocData, sectionHierarchyState, setSectionHierarchyState]);
};

export const useActiveSectionDetection = (setActiveSectionId) => {
  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.main-content');
      if (!container) return;

      const sections = container.querySelectorAll('[data-section-id], [data-segment-id]');
      if (!sections.length) return;

      let mostVisibleSection = null;
      let maxVisibility = 0;

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(windowHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        
        const visibilityPercentage = visibleHeight / rect.height;
        
        if (visibilityPercentage > maxVisibility) {
          maxVisibility = visibilityPercentage;
          mostVisibleSection = section;
        }
      });

      if (mostVisibleSection && (mostVisibleSection.dataset.sectionId || mostVisibleSection.dataset.segmentId)) {
        setActiveSectionId(mostVisibleSection.dataset.sectionId || mostVisibleSection.dataset.segmentId);
      }
    };

    const container = document.querySelector('.main-content');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [setActiveSectionId]);
};

export const useTOCScrollSync = (activeSectionId, isVisible) => {
  const panelRef = useRef(null);
  const activeElementRef = useRef(null);

  useEffect(() => {
    if (!activeSectionId || !isVisible) return;
    const activeElement = document.querySelector(`.section-title.active[data-section-id="${activeSectionId}"]`);
    
    if (activeElement && panelRef.current) { 
      activeElementRef.current = activeElement;

      const panelRect = panelRef.current.getBoundingClientRect();
      const elementRect = activeElement.getBoundingClientRect();

      const isAbove = elementRect.top < panelRect.top;
      const isBelow = elementRect.bottom > panelRect.bottom;

      if (isAbove || isBelow) {
        const scrollOptions = { behavior: 'smooth', block: 'center' };
        activeElement.scrollIntoView(scrollOptions);
      }
    }
  }, [activeSectionId, isVisible]);

  return { panelRef, activeElementRef };
};

export const usePanelNavigation = () => {
  const navigateToSection = (sectionId, options = {}) => {
    const { 
      updateUrl = true, 
      scrollBehavior = 'smooth', 
      loadMoreContent, 
      hasMoreContent, 
      isFetchingNextPage,
      fetchContentBySegmentId 
    } = options;
    
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
      return false;
    }
    
    let targetElement = mainContent.querySelector(`[data-section-id="${sectionId}"]`);
    if (!targetElement) {
      targetElement = mainContent.querySelector(`[data-segment-id="${sectionId}"]`);
    }
    
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: scrollBehavior, 
        block: 'start' 
      });
      
      if (updateUrl) {
        const newParams = new URLSearchParams(window.location.search);
        newParams.set('sectionId', sectionId);
        window.history.replaceState({}, '', `?${newParams.toString()}`);
      }
      
      return true;
    }
    
    if (updateUrl) {
      const newParams = new URLSearchParams(window.location.search);
      newParams.set('sectionId', sectionId);
      window.history.replaceState({}, '', `?${newParams.toString()}`);
    }
    
    if (fetchContentBySegmentId) {
      directNavigateToSection(sectionId, fetchContentBySegmentId, scrollBehavior);
    } else if (loadMoreContent && hasMoreContent && !isFetchingNextPage) {
      autoLoadToSection(sectionId, loadMoreContent, scrollBehavior);
    }
    
    return false;
  };

  const directNavigateToSection = async (targetSectionId, fetchContentBySegmentId, scrollBehavior) => {
    try {
      await fetchContentBySegmentId(targetSectionId);
      
      setTimeout(() => {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        
        let targetElement = mainContent.querySelector(`[data-section-id="${targetSectionId}"]`);
        if (!targetElement) {
          targetElement = mainContent.querySelector(`[data-segment-id="${targetSectionId}"]`);
        }
        
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: scrollBehavior, 
            block: 'start' 
          });
        }
      }, 1000);
      
    } catch (error) {
      throw error;
    }
  };

  const autoLoadToSection = (targetSectionId, loadMoreContent, scrollBehavior) => {
    const checkAndLoad = () => {
      const mainContent = document.querySelector('.main-content');
      if (!mainContent) return;
      
      let targetElement = mainContent.querySelector(`[data-section-id="${targetSectionId}"]`);
      if (!targetElement) {
        targetElement = mainContent.querySelector(`[data-segment-id="${targetSectionId}"]`);
      }
      
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ 
            behavior: scrollBehavior, 
            block: 'start' 
          });
        }, 500);
        return;
      }
      
      loadMoreContent();
      
      setTimeout(() => {
        checkAndLoad();
      }, 1000);
    };
    
    checkAndLoad();
  };

  return { navigateToSection };
};

export const useTOCNavigation = (textId, contentId, versionId, size, segmentId, infiniteQuery) => {
  const queryClient = useQueryClient();
  const fetchContentBySegmentId = async (segmentId) => {
    try {
      let targetSegmentId = segmentId;
      const { data: newData } = await axiosInstance.post(`/api/v1/texts/${textId}/details`, {
        ...(contentId && { content_id: contentId }),
        segment_id: targetSegmentId,
        ...(versionId && { version_id: versionId }),
        direction: "next",
        size: 20,
      });
      
      const queryKey = ["content", textId, contentId, versionId, size, segmentId];
      queryClient.setQueryData(queryKey, {
        pages: [newData], 
        pageParams: [{ segmentId: targetSegmentId, direction: "next" }]
      });
      
      const newParams = new URLSearchParams(window.location.search);
      newParams.set('sectionId', segmentId);
      window.history.replaceState({}, '', `?${newParams.toString()}`);
      return newData;
    } catch (error) {
      throw error;
    }
  };

  return { fetchContentBySegmentId };
};