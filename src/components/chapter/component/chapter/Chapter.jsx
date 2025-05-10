import {useEffect, useRef, useState, useCallback} from "react";
import {getLanguageClass, sourceTranslationOptionsMapper, findAndScrollToSegment, checkSectionsForTranslation} from "../../../../utils/Constants.js";
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
  const lastActiveSectionIdRef = useRef(null); 
  const containerRef = useRef(null);
  const [searchParams] = useSearchParams();
  const { isResourcesPanelOpen, openResourcesPanel, isLeftPanelOpen } = usePanelContext();
  const [versionId, setVersionId] = useState(currentChapter.versionId); // TODO: check whether this is really required
  const isLoadingRef = useRef(false);
  const isLoadingTopRef = useRef(false);
  const totalContentRef = useRef(0)
  const [skipDetails, setSkipDetails] = useState({
    skip: currentChapter.contentIndex !== undefined ? parseInt(currentChapter.contentIndex, 10) : parseInt(searchParams.get("contentIndex") || 0, 10),
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
    setSkipDetails({
      skip: parseInt(currentChapter.contentIndex, 10),
      direction: 'down'
    });
  }, [versionId, contentId, textId, segmentId, sectionId, currentChapter.contentIndex]);

  useEffect(() => {
    if (!textDetails) return;
    
    if (currentChapter.contentId === "" && textDetails.content.id) {
      updateChapter(currentChapter, { contentId: textDetails.content.id });
    }
    
    if (textDetails.mapping && isInitialLoadRef.current) {
      const targetId = textDetails.mapping.segment_id || textDetails.mapping.section_id;
      if (targetId) {
        findAndScrollToSegment(targetId, setSelectedSegmentId, currentChapter);
        isInitialLoadRef.current = false;
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

  //handle scrolling to section when sectionId changes
  useEffect(() => {
    if (!currentChapter.sectionId || !containerRef.current) return;
    
    const scrollTimeout = setTimeout(() => {
      const sectionElement = containerRef.current.querySelector(
        `[data-section-id="${currentChapter.sectionId}"]`
      );
      
      if (sectionElement) {
        const container = containerRef.current;
        
        const sectionRect = sectionElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offsetTop = sectionRect.top - containerRect.top + container.scrollTop;
        
        container.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    }, 300);
    
    return () => clearTimeout(scrollTimeout);
  }, [currentChapter.sectionId]);

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

  const throttle = useCallback((callback, delay) => {
    let lastCall = 0;
    return function(...args) {
      const now = new Date().getTime();
      if (now - lastCall >= delay) {
        lastCall = now;
        callback(...args);
      }
    };
  }, []);

  // Function to determine which section is in view
  const determineActiveSectionInView = useCallback(() => {
    if (!containerRef.current) return;

    const sections = containerRef.current.querySelectorAll('[data-section-id]');
    if (!sections.length) return;

    if (isLoadingRef.current) return;

    const containerTop = containerRef.current.getBoundingClientRect().top;

    let closestSection = null;
    let minDistance = Number.MAX_VALUE;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const distance = rect.top - containerTop;
      if (distance >= 0 && distance < minDistance) {
        minDistance = distance;
        closestSection = section;
      }
    });

    if (closestSection) {
      const newActiveSectionId = closestSection.getAttribute('data-section-id');
      if (newActiveSectionId !== lastActiveSectionIdRef.current) {
        lastActiveSectionIdRef.current = newActiveSectionId;
        setActiveSectionId(newActiveSectionId);
      }
    }
  }, []);

  const throttledScrollSpy = useCallback(
    throttle(determineActiveSectionInView, 150),
    [throttle, determineActiveSectionInView]
  );

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const handleScroll = () => {
      const {scrollTop, scrollHeight, clientHeight} = currentContainer;
  
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
          const newSkip = skipsCoveredRef.current.has(skipDetails.skip + 1)
            ? Math.max(...Array.from(skipsCoveredRef.current)) + 1
            : skipDetails.skip + 1;
          
          if (newSkip < totalContentRef.current) {
            setSkipDetails({
              skip: newSkip,
              direction: 'down'
            });
          } else {
            isLoadingRef.current = false; 
          }
        }
      }

      if (scrollTop < 10 && isScrollingUp && !isLoadingTopRef.current && contents.length > 0) {
        const firstSectionNumber = contents[0]?.section_number;
        if (firstSectionNumber && firstSectionNumber > 1) {
          isLoadingTopRef.current = true;
          const newSkip = skipsCoveredRef.current.has(Math.max(0, firstSectionNumber - 2))
            ? skipDetails.skip
            : Math.max(0, firstSectionNumber - 2);
          
          if (newSkip >= 0 && !skipsCoveredRef.current.has(newSkip)) {
            setSkipDetails({
              skip: newSkip,
              direction: 'up'
            });
          } else {
            isLoadingTopRef.current = false;
          }
        }
      }
      throttledScrollSpy();
    };
    
    skipsCoveredRef.current.add(skipDetails.skip);
    currentContainer.addEventListener('scroll', handleScroll);

    // Initial check for active section after a short delay
    const initialCheckTimeout = setTimeout(determineActiveSectionInView, 300);

    return () => {
      currentContainer.removeEventListener('scroll', handleScroll);
      clearTimeout(initialCheckTimeout);
    };
  }, [contents, skipDetails.skip, totalContentRef.current, throttledScrollSpy]);

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

  const handleSidebarToggle = (isOpen) => {
    if (isOpen) {
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
        className={`text-segment mb-3 mb-md-4 ${isResourcesPanelOpen && selectedSegmentId === segment.segment_id ? 'selected' : ''}`}
        onClick={(e) => {
          if (!e.target.classList ||
            (!e.target.classList.contains('footnote-marker') &&
              !e.target.classList.contains('footnote'))) {
            setSelectedSegmentId(segment.segment_id);
            setSelectedSectionIndex(currentSectionIndex);
            handleSidebarToggle(true);
          }
        }}
      >
        <div className="segment">
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

  const renderSection = (section, parentSectionIndex = null) => {
    if (!section) return null;
    const currentSectionIndex = section.sectionindex !== undefined ? section.sectionindex : parentSectionIndex;
    
    return (
      <div 
        key={section.id} 
        className="nested-section"
        data-section-id={section.id}
      >
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