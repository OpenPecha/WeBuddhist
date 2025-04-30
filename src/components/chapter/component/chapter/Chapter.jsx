import {useEffect, useRef, useState} from "react";
import {getLanguageClass, sourceTranslationOptionsMapper, findAndScrollToSegment} from "../../../../utils/Constants.js";
import {useSearchParams} from "react-router-dom";
import {useQuery} from "react-query";
import {Container, Spinner} from "react-bootstrap";
import Resources from "../../../resources-side-panel/Resources.jsx";
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
  const [selectedOption, setSelectedOption] = useState(sourceTranslationOptionsMapper.source_translation);
  const containerRef = useRef(null);
  const [searchParams] = useSearchParams();
  const { isResourcesPanelOpen, openResourcesPanel } = usePanelContext();
  const [versionId, setVersionId] = useState(currentChapter.versionId); // TODO: check whether this is really required
  const isLoadingRef = useRef(false);
  const isLoadingTopRef = useRef(false);
  const totalContentRef = useRef(0)
  const [skipDetails, setSkipDetails] = useState({
    skip: currentChapter.contentIndex !== undefined ? currentChapter.contentIndex : searchParams.get("contentIndex") || 0,
    direction: 'down'
  });
  const skipsCoveredRef = useRef(new Set());
  const [scrollPosition, setScrollPosition] = useState(0);
  const lastScrollPositionRef = useRef(0);
  const textId = currentChapter.textId || searchParams.get("text_id");
  const segmentId = currentChapter.segmentId;
  const contentId = currentChapter.contentId
  const sectionId = currentChapter.sectionId;
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
  }, [versionId, contentId, textId, segmentId, sectionId]);

  const isInitialLoadRef = useRef(true);
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
  }, [textDetails, currentChapter, updateChapter]);


  useEffect(() => {
    if (!textDetails) return;

    setContents(prev => {
      const incomingSections = textDetails.content.sections;
      const existingSectionNumbers = new Set(prev.map(section => section.section_number));

      const filteredSections = incomingSections.filter(
        section => !existingSectionNumbers.has(section.section_number)
      );

      if(skipDetails.direction === 'up'){
        const currentContainer = containerRef.current;
        if (!currentContainer) return;

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
        return [...filteredSections, ...prev]
      }else{
        return  [...prev, ...filteredSections];
      }

    });
    if (!totalContentRef.current) {
      totalContentRef.current = textDetails?.total
    }

    isLoadingRef.current = false;
    isLoadingTopRef.current = false;
  }, [textDetails]);

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
      if (bottomScrollPosition > 0.99 && !isLoadingRef.current) {
        isLoadingRef.current = true;
        setSkipDetails(prevState => ({
          skip: skipsCoveredRef.current.has(skipDetails.skip + 1)
            ? Math.max(...Array.from(skipsCoveredRef.current)) + 1
            : prevState.skip + 1,
          direction: 'down'
        }));
      }

      if (scrollTop < 10 && isScrollingUp && !isLoadingTopRef.current && contents.length > 0) {
        const firstSectionNumber = contents[0]?.section_number;
        if (firstSectionNumber && firstSectionNumber > 1) {
          isLoadingTopRef.current = true;
          setSkipDetails(prevState => ({
            skip: skipsCoveredRef.current.has(Math.max(0, firstSectionNumber - 2))
              ? prevState.skip
              : Math.max(0, firstSectionNumber - 2),
            direction: 'up'
          }));
        }
      }
    };
    skipsCoveredRef.current.add(skipDetails.skip)
    currentContainer.addEventListener('scroll', handleScroll);

    return () => currentContainer.removeEventListener('scroll', handleScroll);
  }, [contents]);

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

  const renderSegments = (segments) => {
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
        className="text-segment mb-3 mb-md-4"
        onClick={(e) => {
          if (!e.target.classList ||
            (!e.target.classList.contains('footnote-marker') &&
              !e.target.classList.contains('footnote'))) {
            setSelectedSegmentId(segment.segment_id);
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
            <div className="translation-content" dangerouslySetInnerHTML={{__html: segment.translation.content}}/>
          )}
        </div>
      </div>
    );
  });
  };

  const renderSection = (section) => {
    if (!section) return null;
    
    return (
      <div 
        key={section.id} 
        className="nested-section"
        data-section-id={section.id}
      >
        {section.title && <h4 className="section-title">{section.title}</h4>}
        
        {renderSegments(section.segments)}
        
        {section.sections && section.sections.length > 0 && 
          section.sections.map(nestedSection => renderSection(nestedSection))
        }
      </div>
    );
  };

  // main renderer
  return (
    <div className="chapter">
      <ChapterHeader selectedOption={selectedOption} currentChapter={currentChapter} removeChapter={removeChapter}
                     setSelectedOption={setSelectedOption} textDetails={textDetails?.text_detail}
                     totalPages={totalPages}/>
      <Container fluid className="p-0">
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
          
          {contents?.map(section => (
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
          addChapter={addChapter}
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