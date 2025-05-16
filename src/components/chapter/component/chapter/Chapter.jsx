import {useEffect, useRef, useState, useCallback} from "react";
import {getLanguageClass, sourceTranslationOptionsMapper, findAndScrollToSegment, findAndScrollToSection, checkSectionsForTranslation} from "../../../../utils/Constants.js";
import {useSearchParams} from "react-router-dom";
import {useQuery} from "react-query";
import {Container, Spinner} from "react-bootstrap";
import Resources from "../../../resources-side-panel/Resources.jsx";
import LeftSidePanel from "../left-side-panel/LeftSidePanel.jsx";
import axiosInstance from "../../../../config/axios-config.js";
import "./Chapter.scss"
import ChapterHeader from "../chapter-header/ChapterHeader.jsx";
import { usePanelContext, PanelProvider } from "../../../../context/PanelContext.jsx";

export const fetchTextDetails = async (text_id, contentId, versionId,skip, limit,segmentId,sectionId) => {

  const {data} = await axiosInstance.post(`/api/v1/texts/${text_id}/details`, {
    ...(contentId && { content_id: contentId }),
    ...(versionId && { version_id: versionId }),
    ...(segmentId && { segment_id: segmentId }),
    ...(sectionId && { section_id: sectionId }),
    limit,
    skip
  });
  return data;
}

const Chapter = ({addChapter, removeChapter, updateChapter, currentChapter, totalPages}) => {
  const [contents, setContents] = useState([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState("");
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(null);
  const [selectedOption, setSelectedOption] = useState(sourceTranslationOptionsMapper.source);
  const [hasTranslation, setHasTranslation] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const containerRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { isResourcesPanelOpen, openResourcesPanel, isLeftPanelOpen } = usePanelContext();
  const [versionId, setVersionId] = useState(currentChapter.versionId); // TODO: check whether this is really required
  const isLoadingRef = useRef(false);
  const isLoadingTopRef = useRef(false);
  const totalContentRef = useRef(0);
  const isPanelNavigationRef = useRef(false);
  const isScrollLoadingRef = useRef(false);
  const [skipDetails, setSkipDetails] = useState({
    skip: parseInt(searchParams.get("contentIndex") || 0, 10) || parseInt(currentChapter.contentIndex, 10),
    direction: 'down'
  });
  const skipsCoveredRef = useRef(new Set());
  const [scrollPosition, setScrollPosition] = useState(0);
  const lastScrollPositionRef = useRef(0);
  const textId = currentChapter.textId || searchParams.get("text_id");
  const segmentId = currentChapter.segmentId;
  const contentId = currentChapter.contentId
  const sectionId = currentChapter.sectionId;
  const isInitialLoadRef = useRef(true);
  const { data: textDetails,  isLoading: chapterContentIsLoading } = useQuery(
    ['chapter', textId, contentId, skipDetails.skip, versionId, segmentId, sectionId],
    () => fetchTextDetails(textId, contentId, versionId, skipDetails.skip, 1, segmentId, sectionId),
    {
      refetchOnWindowFocus: false,
      enabled: totalContentRef.current !== 0 ? (skipDetails.skip  < totalContentRef.current) : true,
    }
  );
  useEffect(() => {
    setContents([]);
    isInitialLoadRef.current = true;
    skipsCoveredRef.current = new Set();
    isLoadingRef.current = false;
    isLoadingTopRef.current = false;
    totalContentRef.current = 0;
    
    const skipValue = currentChapter.contentIndex !== undefined && !isNaN(parseInt(currentChapter.contentIndex, 10)) 
      ? parseInt(currentChapter.contentIndex, 10) 
      : 0;    
    setSkipDetails({
      skip: skipValue,
      direction: 'down'
    });
    isPanelNavigationRef.current = true;
  }, [versionId, contentId, textId, segmentId, sectionId, currentChapter.contentIndex]);

  // Reset scroll loading flag when sectionId changes (for left panel navigation)
  useEffect(() => {
    isScrollLoadingRef.current = false;
  }, [currentChapter.sectionId]);

  useEffect(() => {
    if (!textDetails) return;
    
    if (currentChapter.contentId === "" && textDetails.content.id) {
      updateChapter(currentChapter, { contentId: textDetails.content.id });
    }
    
    if (textDetails.mapping && isInitialLoadRef.current && !isSectionChangeInProgressRef.current) {
      const targetId = textDetails.mapping.segment_id || textDetails.mapping.section_id || searchParams.get("segment_id");
      if (targetId) {
        setTimeout(() => {
          if (!isSectionChangeInProgressRef.current && !isScrollLoadingRef.current) {
            console.log('scroll to segment boy',targetId)
            findAndScrollToSegment(targetId, setSelectedSegmentId, currentChapter);
          }
          isInitialLoadRef.current = false;
        }, 300);
      }
    }
    
    const checkTranslation = () => {
      if (textDetails.content && textDetails.content.sections) {
        const hasAnyTranslation = checkSectionsForTranslation(textDetails.content.sections);
        setHasTranslation(hasAnyTranslation);
        if (hasAnyTranslation) {
          setSelectedOption(sourceTranslationOptionsMapper.source_translation);
        } else {
          setSelectedOption(sourceTranslationOptionsMapper.source);
        }
      }
    };
    
    checkTranslation();
  }, [textDetails, currentChapter, updateChapter]);

  const isSectionChangeInProgressRef = useRef(false);
  // Helper function to check if a section ID exists in nested sections
  const checkSectionHierarchy = (sections, targetId) => {
    if (!sections || !sections.length) return false;
    
    for (const section of sections) {
      if (section.id === targetId) return true;
      
      if (section.sections && section.sections.length > 0) {
        const found = checkSectionHierarchy(section.sections, targetId);
        if (found) return true;
      }
    }
    
    return false;
  };

  useEffect(() => {
    if (!currentChapter.sectionId || !containerRef.current) return;
    
    isSectionChangeInProgressRef.current = true;
    
    const container = containerRef.current;
    if (!container) {
      isSectionChangeInProgressRef.current = false;
      return;
    }
    
    // Check if the section is already in the loaded contents
    const sectionExists = contents.some(section => {
      if (section.id === currentChapter.sectionId) return true;
      if (section.sections) {
        return checkSectionHierarchy(section.sections, currentChapter.sectionId);
      }
      return false;
    });
    
    if (sectionExists) {
      // Use the dedicated section scrolling function
      // console.log(' the section old')
      // findAndScrollToSection(currentChapter.sectionId, currentChapter);
      // setTimeout(() => {
      //   isSectionChangeInProgressRef.current = false;
      // }, 300);
    } else {
      if (contents.length === 0 && textDetails && textDetails.content && textDetails.content.sections) {
        setContents(textDetails.content.sections.map(section => ({ ...section, sectionindex: section.section_number - 1 })));
      }
      isSectionChangeInProgressRef.current = false;
    }
    return () => {
      isSectionChangeInProgressRef.current = false;
    };
  }, [currentChapter.sectionId, contents.length, textDetails]);

  useEffect(() => {
    if (!textDetails) return;

    setContents(prev => {
      const incomingSections = textDetails.content.sections;
      const existingSectionNumbers = new Set(prev.map(section => section.section_number));

      const filteredSections = incomingSections
        .filter(section => !existingSectionNumbers.has(section.section_number))
        .map(section => ({ ...section, sectionindex:section.section_number - 1 }));

      if(skipDetails.direction === 'up'){
        const currentContainer = containerRef.current;
        if (!currentContainer) return prev;

        const currentScrollHeight = currentContainer?.scrollHeight || 0;

        if (skipDetails.direction === 'up') {
          setTimeout(() => {
            if (currentContainer) {
              const newScrollHeight = currentContainer.scrollHeight;
              const heightDifference = newScrollHeight - currentScrollHeight;
              currentContainer.scrollTop = heightDifference + scrollPosition;
            }
          }, 0);
        }
        return [...filteredSections, ...prev];
      } else {
        return [...prev, ...filteredSections];
      }
    });
    if (textDetails?.total) {
      totalContentRef.current = textDetails.total;
    }

    isLoadingRef.current = false;
    isLoadingTopRef.current = false;
  }, [textDetails]);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const handleScroll = () => {
      const {scrollTop, scrollHeight, clientHeight} = currentContainer;
      if (isPanelNavigationRef.current) {
        isPanelNavigationRef.current = false;
        lastScrollPositionRef.current = scrollTop;
        return;
      }
      // Determine scroll direction using ref for immediate access to previous value
      const isScrollingUp = scrollTop < lastScrollPositionRef.current;
  
      // Store current position for next comparison
      lastScrollPositionRef.current = scrollTop;
      setScrollPosition(scrollTop);

      // Check if scrolled near bottom
      const bottomScrollPosition = (scrollTop + clientHeight) / scrollHeight;
      if (bottomScrollPosition > 0.99 && !isLoadingRef.current && totalContentRef.current > 0) {
        if (skipDetails.skip < totalContentRef.current - 1) {
          isLoadingRef.current = true;
          isScrollLoadingRef.current = true; // Set flag when loading due to scroll
          const newSkip = skipsCoveredRef.current.has(skipDetails.skip + 1)
            ? Math.max(...Array.from(skipsCoveredRef.current)) + 1
            : skipDetails.skip + 1;
          if (newSkip < totalContentRef.current) {
            if (!isPanelNavigationRef.current) {
              setSkipDetails({  
                skip: newSkip,
                direction: 'down'
              });
            }
          } else {
            isLoadingRef.current = false;
            isScrollLoadingRef.current = false; // Reset flag when not loading
          }
        }
      }

      if (scrollTop < 10 && isScrollingUp && !isLoadingTopRef.current && contents.length > 0) {
        const firstSectionNumber = contents[0]?.section_number;
        if (firstSectionNumber && firstSectionNumber > 1) {
          isLoadingTopRef.current = true;
          isScrollLoadingRef.current = true; // Set flag when loading due to scroll
          const newSkip = skipsCoveredRef.current.has(Math.max(0, firstSectionNumber - 2))
            ? skipDetails.skip
            : Math.max(0, firstSectionNumber - 2);
          
          if (newSkip >= 0 && !skipsCoveredRef.current.has(newSkip)) {
            if (!isPanelNavigationRef.current) {
              setSkipDetails({
                skip: newSkip,
                direction: 'up'
              });
            }
          } else {
            isLoadingTopRef.current = false;
            isScrollLoadingRef.current = false; // Reset flag when not loading
          }
        }
      }
    };
    
    skipsCoveredRef.current.add(skipDetails.skip);
    currentContainer.addEventListener('scroll', handleScroll);

    return () => {
      currentContainer.removeEventListener('scroll', handleScroll);
    };
  }, [contents, skipDetails.skip, totalContentRef.current]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('click', handleDocumentClick);
    }
    return () => {
      if (container) {
        container.removeEventListener('click', handleDocumentClick);
      }
    };
  }, []);

  // helper function
  const handleDocumentClick = (event) => {
    if (event.target.classList && event.target.classList.contains('footnote-marker')) {
      event.stopPropagation();
      event.preventDefault();
      const footnoteMarker = event.target;
      const footnote = footnoteMarker.nextElementSibling;

      if (footnote && footnote.classList.contains('footnote')) {
        footnote.classList.toggle('active');
      }
      return false;
    }
  };

  const handleVersionChange = (newVersionId) => {
    setVersionId(newVersionId);
  };

  const handleSidebarToggle = (isOpen,segmentsend) => {
    if (isOpen) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('segment_id', segmentsend);
      setSearchParams(newParams);
      openResourcesPanel();
    }
  };

  const renderSegments = (segments, currentSectionIndex) => {
    if (!segments || segments.length === 0) return null;
    
    return segments.map(segment => {
      const hasTranslation = segment.translation && segment.translation.content;
      const showTranslation = (selectedOption === sourceTranslationOptionsMapper.translation || 
                             selectedOption === sourceTranslationOptionsMapper.source_translation) && 
                             hasTranslation;
      const showSource = selectedOption === sourceTranslationOptionsMapper.source || 
                       selectedOption === sourceTranslationOptionsMapper.source_translation;

      if (selectedOption === sourceTranslationOptionsMapper.translation && !hasTranslation) {
        return null;
      }
      return (
        <div
        key={segment.segment_id}
        data-segment-id={segment.segment_id}
        className={`text-segment mb-3 mb-md-4 ${isResourcesPanelOpen && selectedSegmentId === segment.segment_id ? 'selected' : ''} ${selectedSegmentId === segment.segment_id ? 'highlighted-segment' : ''}`}
        onClick={(e) => {
          if (!e.target.classList ||
            (!e.target.classList.contains('footnote-marker') &&
              !e.target.classList.contains('footnote'))) {
            setSelectedSegmentId(segment.segment_id);
            setSelectedSectionIndex(currentSectionIndex);
            handleSidebarToggle(true,segment.segment_id);
          }
        }}
      >
        <div className="segment">
          {segment.segment_id}
        <span className="segment-number">{segment.segment_number}</span>
          {showSource && (
            <>
              <div dangerouslySetInnerHTML={{__html: segment.content}}/>
            </>
          )}
          {showTranslation && (
            <div className={`translation-content ${getLanguageClass(segment.translation.language)}`} dangerouslySetInnerHTML={{__html: segment.translation.content}}/>
          )}
        </div>
      </div>
    );
  });
  };
  // Handle scroll events to track active section
  const handleScrollSpy = useCallback(() => {
    if (!containerRef.current) return;
    
    const sections = containerRef.current.querySelectorAll('[data-section-id]');
    if (!sections.length) return;
    
    // Get the section that is most visible in the viewport
    let mostVisibleSection = null;
    let maxVisibility = 0;
    
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the section is visible in the viewport
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(windowHeight, rect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      
      // Calculate the percentage of the section that is visible
      const visibilityPercentage = visibleHeight / rect.height;
      
      if (visibilityPercentage > maxVisibility) {
        maxVisibility = visibilityPercentage;
        mostVisibleSection = section;
      }
    });
    
    if (mostVisibleSection && mostVisibleSection.dataset.sectionId) {
      setActiveSectionId(mostVisibleSection.dataset.sectionId);
    }
  }, []);
  
  // Set up scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Initial check for visible sections
    handleScrollSpy();
    
    // Add scroll event listener
    container.addEventListener('scroll', handleScrollSpy);
    
    return () => {
      container.removeEventListener('scroll', handleScrollSpy);
    };
  }, [handleScrollSpy, contents]);
  
  // Update active section when content changes
  useEffect(() => {
    handleScrollSpy();
  }, [contents, handleScrollSpy]);

  useEffect(() => {
    if (currentChapter && textDetails) {
      
        if (currentChapter.segmentId) {
          console.log('new i am not')
          findAndScrollToSegment(currentChapter.segmentId, setSelectedSegmentId, currentChapter);
        } else if (currentChapter.sectionId) {
          if (!isScrollLoadingRef.current) {
          console.log('new section')
          findAndScrollToSection(currentChapter.sectionId, currentChapter);
          }
          else{
            console.log('Skipping scroll to section - content loaded due to user scrolling');

          }
        }
    }
  }, [currentChapter.uniqueId, textDetails]);
  
  const renderSection = (section, parentSectionIndex = null) => {
    if (!section) return null;
    const currentSectionIndex = section.sectionindex !== undefined ? section.sectionindex : parentSectionIndex;
    
    return (
      <div 
        key={section.id} 
        className="nested-section"
        data-section-id={section.id}
        id={`section-${section.id}`} // Add a unique ID attribute for more reliable targeting
      >
        {section.id}
        {section.title && <h4 className="section-title">{section.title}</h4>}
        
        {section.segments && section.segments.length > 0 && renderSegments(section.segments, currentSectionIndex)}
        
        {section.sections && section.sections.length > 0 && 
          section.sections.map(nestedSection => renderSection(nestedSection, currentSectionIndex))
        }
      </div>
    );
  };

  // main renderer
  return (
    <div className="chapter">
      <ChapterHeader selectedOption={selectedOption} currentChapter={currentChapter} removeChapter={removeChapter}
                     setSelectedOption={setSelectedOption} textDetails={textDetails?.text_detail}
                     totalPages={totalPages} hasTranslation={hasTranslation}/>
      <Container fluid className="p-0">
        {isLeftPanelOpen && <LeftSidePanel 
          updateChapter={updateChapter} 
          currentChapter={currentChapter} 
          activeSectionId={activeSectionId}
        />}
        <div
          ref={containerRef}
          className="tibetan-text-container"
          onScroll={handleScrollSpy}
        >
          {chapterContentIsLoading && skipDetails.direction.includes("up") && (
            <div className="text-center my-3 my-md-4">
              <Spinner animation="border" role="output" size="sm">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
       
          {contents?.map((section) => (
            <div 
              key={section.id} 
              className={`section ${textDetails?.text_detail?.language ? getLanguageClass(textDetails.text_detail.language) : ''}`}
              data-section-id={section.id}
            >
              {renderSection(section)}
            </div>
          ))}
          {chapterContentIsLoading && skipDetails.direction.includes("down") && (
            <div className="text-center my-3 my-md-4">
              <Spinner animation="border" role="output" size="sm">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
        </div>
        {isResourcesPanelOpen && selectedSegmentId && <Resources
          segmentId={selectedSegmentId}
          setVersionId={handleVersionChange}
          versionId={versionId}
          addChapter={(chapterInfo) => addChapter(chapterInfo, currentChapter)} 
          sectionindex={selectedSectionIndex}
        />}
      </Container>
    </div>
  );
};

const ChapterWithPanelContext = (props) => (
  <PanelProvider>
    <Chapter {...props} />
  </PanelProvider>
);

export default ChapterWithPanelContext;