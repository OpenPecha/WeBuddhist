import {useEffect, useRef, useState} from "react";
import {getLanguageClass, sourceTranslationOptionsMapper} from "../../../../utils/Constants.js";
import {useSearchParams, useLocation} from "react-router-dom";
import {useQuery} from "react-query";
import {Container, Spinner} from "react-bootstrap";
import Resources from "../../../resources-side-panel/Resources.jsx";
import axiosInstance from "../../../../config/axios-config.js";
import "./Chapter.scss"
import ChapterHeader from "../chapter-header/ChapterHeader.jsx";

export const fetchTextDetails = async (text_id, contentId, versionId,skip, limit,segmentId) => {

  const {data} = await axiosInstance.post(`/api/v1/texts/${text_id}/details`, {
     content_id: contentId || "" ,
    ...(versionId && { version_id: versionId }),
    ...(segmentId && { segment_id: segmentId }),
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
  const [showPanel, setShowPanel] = useState(false);
  const [versionId, setVersionId] = useState(currentChapter.versionId); // TODO: check whether this is really required
  const isLoadingRef = useRef(false);
  const isLoadingTopRef = useRef(false);
  const totalContentRef = useRef(0)
  const location = useLocation();
  // Initialize skip with contentIndex from currentChapter or from location state
  const initialSkip = currentChapter.contentIndex !== undefined ? currentChapter.contentIndex : location?.state?.chapterInformation?.contentIndex || 0;
  const [skip, setSkip] = useState(initialSkip);
  const [topSkip, setTopSkip] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const lastScrollPositionRef = useRef(0);
  const textId = currentChapter.textId || searchParams.get("text_id");
  const segmentId = currentChapter.segmentId;
  const contentId = currentChapter.contentId
  // Query for fetching content when scrolling down
  const {data: textDetails, isLoading: chapterContentIsLoading} = useQuery(
    ["chapter", textId, contentId, skip, versionId, segmentId],
    () => fetchTextDetails(textId, contentId, versionId, skip, 1, segmentId),
    {
      refetchOnWindowFocus: false,
      enabled: totalContentRef.current !== 0 ? (skip) + 1 <= totalContentRef.current: true    
    }
  );
  // Query for fetching content when scrolling up
  const {data: previousTextDetails, isLoading: previousContentIsLoading} = useQuery(
    ["chapter-previous", textId, contentId, topSkip, versionId, segmentId],
    () => fetchTextDetails(textId, contentId, versionId, topSkip, 1, segmentId),
    {
      refetchOnWindowFocus: false,
      enabled: topSkip !== null && topSkip >= 0    
    }
  );
  useEffect(() => {
    setTopSkip(null);
    setContents([]);
    setSkip(initialSkip);
  }, [versionId, contentId, textId, segmentId, initialSkip]);
 
  useEffect(() => {
    if (!textDetails) return;
    if (skip === 0) {
      setContents(textDetails.content.sections);
    } else {
      setContents(prevState => {
        return [...prevState, ...textDetails.content.sections];
      });
    }

    if(!totalContentRef.current){
      totalContentRef.current = textDetails?.total
    }
  }, [textDetails, skip]);
  
  useEffect(() => {
    if (!textDetails) return;
    
    if (currentChapter.contentId === "" && textDetails.content.id) {
      updateChapter(currentChapter, { contentId: textDetails.content.id });
    }
  }, [textDetails, currentChapter, updateChapter]);


  //for scroll up data
  useEffect(() => {
    if (!previousTextDetails) return;    
    setContents(prevState => {
      const currentContainer = containerRef.current;
      const currentScrollHeight = currentContainer?.scrollHeight || 0;
      
      const newContents = [...previousTextDetails.content.sections, ...prevState];
      
      // After the next render, restore scroll position (if not it shows from the top)
      setTimeout(() => {
        if (currentContainer) {
          const newScrollHeight = currentContainer.scrollHeight;
          const heightDifference = newScrollHeight - currentScrollHeight;
          currentContainer.scrollTop = heightDifference + scrollPosition;
        }
      }, 0);
      
      return newContents;
    });
    
    // Reset topSkip to prevent continuous fetching
    setTopSkip(null);
    
  }, [previousTextDetails]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("chapters")
    }
  }, [])

  useEffect(() => {
    isLoadingRef.current = chapterContentIsLoading;
    isLoadingTopRef.current = previousContentIsLoading;
  }, [chapterContentIsLoading, previousContentIsLoading]);

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
        setSkip(prev => prev + 1);
      }
  
      // Check if scrolled near top - ONLY when scrolling up
      if (scrollTop < 10 && isScrollingUp && !isLoadingTopRef.current && contents.length > 0) {
        // Only fetch previous content if we're not at the very beginning
        const firstSectionNumber = contents[0]?.section_number;
        if (firstSectionNumber && firstSectionNumber > 1) {
          isLoadingTopRef.current = true;
          // Set topSkip to fetch the previous content
          setTopSkip(Math.max(0, firstSectionNumber - 2)); // -2 to get the previous section
        }
      }
    };

   
      currentContainer.addEventListener('scroll', handleScroll);
    
    
    return () => {
      
        currentContainer.removeEventListener('scroll', handleScroll);
      
    };
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
    setShowPanel(isOpen);
  };

  const renderSegments = (segments) => {
    if (!segments || segments.length === 0) return null;
    
    return segments.map(segment => (
      <div
        key={segment.segment_id}
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
          {(selectedOption === sourceTranslationOptionsMapper.source || selectedOption === sourceTranslationOptionsMapper.source_translation) && (
            <>
              <span className="segment-number">{segment.segment_number}</span>
              <div dangerouslySetInnerHTML={{__html: segment.content}}/>
            </>
          )}
          {(selectedOption === sourceTranslationOptionsMapper.translation || selectedOption === sourceTranslationOptionsMapper.source_translation) && segment?.translation?.content && (
            <div className="translation-content" dangerouslySetInnerHTML={{__html: segment.translation.content}}/>
          )}
        </div>
      </div>
    ));
  };

  const renderSection = (section) => {
    if (!section) return null;
    
    return (
      <div key={section.id} className="nested-section">
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
          {previousContentIsLoading && (
            <div className="text-center my-3 my-md-4">
              <Spinner animation="border" role="output" size="sm">
                <span className="visually-hidden">Loading previous content...</span>
              </Spinner>
            </div>
          )}
          
          {contents?.map(section => (
            <div key={section.id} className={`section ${textDetails?.text_detail?.language ? getLanguageClass(textDetails.text_detail.language) : ''}`}>
              {renderSection(section)}
            </div>
          ))}
          {chapterContentIsLoading && (
            <div className="text-center my-3 my-md-4">
              <Spinner animation="border" role="output" size="sm">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
        </div>
        {selectedSegmentId && <Resources
          segmentId={selectedSegmentId}
          showPanel={showPanel}
          setShowPanel={handleSidebarToggle}
          setVersionId={handleVersionChange}
          versionId={versionId}
          addChapter={addChapter}
        />}
      </Container>
    </div>
  );
};

export default Chapter;