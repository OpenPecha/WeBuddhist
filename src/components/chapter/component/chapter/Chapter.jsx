import {useEffect, useMemo, useRef, useState} from "react";
import {getLanguageClass, sourceTranslationOptionsMapper} from "../../../../utils/Constants.js";
import {useSearchParams, useLocation} from "react-router-dom";
import {useQuery} from "react-query";
import {Container, Spinner} from "react-bootstrap";
import Resources from "../../../resources-side-panel/Resources.jsx";
import axiosInstance from "../../../../config/axios-config.js";
import "./Chapter.scss"
import ChapterHeader from "../chapter-header/ChapterHeader.jsx";

export const fetchTextDetails = async (text_id, content_id, versionId, skip, limit) => {
  const {data} = await axiosInstance.post(`/api/v1/texts/${text_id}/details`, {
    content_id: content_id ?? "",
    version_id: versionId ?? "",
    limit,
    skip
  });
  return data;
}
const Chapter = ({addChapter, removeChapter, currentChapter, totalPages}) => {
  const [contents, setContents] = useState([]);
  
  const [selectedSegmentId, setSelectedSegmentId] = useState("");
  const [selectedOption, setSelectedOption] = useState(sourceTranslationOptionsMapper.source_translation);
  const containerRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [showPanel, setShowPanel] = useState(false);
  const [versionId, setVersionId] = useState(currentChapter.versionId); // TODO: check whether this is really required
  const isLoadingRef = useRef(false);
  const totalContentRef = useRef(0)
  const location = useLocation();
  const skipnumber=location?.state?.chapterInformation?.contentindex
  const [skip, setSkip] = useState(skipnumber);
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

  const textId = searchParams.get("text_id");
  const contentId = currentChapter.contentId
  const {data: textDetails, isLoading: chapterContentIsLoading} = useQuery(
    ["chapter", textId, contentId, skip, versionId],
    () => fetchTextDetails(textId, contentId, versionId, skip, 1),
    {
      refetchOnWindowFocus: false,
      enabled: totalContentRef.current !== 0 ? (skip) + 1 <= totalContentRef.current: true
    }
  );
  // Reset skip when versionId changes
  useEffect(() => {
    setSkip(skipnumber);
    setContents([]);
  }, [versionId, contentId]);
 
  useEffect(() => {
    if (!textDetails) return;
    if (skip === 0) {
      setContents(textDetails.contents);
    } else {
      setContents(prevState => {
        return [...prevState, ...textDetails.contents]
      });
    }

    if(!totalContentRef.current){
      totalContentRef.current = textDetails?.total
    }
  }, [textDetails, skip]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("chapters")
    }
  }, [])


  useEffect(() => {
    isLoadingRef.current = chapterContentIsLoading;
  }, [chapterContentIsLoading]);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const handleScroll = () => {
      const {scrollTop, scrollHeight, clientHeight} = currentContainer;
      const scrollPosition = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPosition > 0.99 && !isLoadingRef.current) {
        isLoadingRef.current = true;
        setSkip(prev => prev + 1);
      }
    };

    currentContainer.addEventListener('scroll', handleScroll);
    return () => {
      currentContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

  const handleVersionChange = (newVersionId) => {
    setVersionId(newVersionId);
  };

  const handleSidebarToggle = (isOpen) => {
    setShowPanel(isOpen);
  };


  const renderContent = (item) => {
    return (
      <div key={item.id} className={`section ${getLanguageClass(textDetails?.text_detail?.language)}`}>
        {item.title && <h4 className="section-title">{item.title}</h4>}

        {item?.segments?.map(segment => (
          <div
            key={segment.id}
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
            <div key={segment.segment_id} className="segment">
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
        ))}

        {item?.sections?.map(section => (
          <div key={section.id} className="nested-section">
            <h4 className="section-title">{section.title}</h4>
            {section?.segments?.map(segment => (
              <div
                key={segment.id}
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
                <div key={segment.segment_id} className="segment">
                  {(selectedOption === sourceTranslationOptionsMapper.source || selectedOption === sourceTranslationOptionsMapper.source_translation) && (
                    <>
                      <span className="segment-number">{segment.segment_number}</span>
                      <div dangerouslySetInnerHTML={{__html: segment.content}}/>
                    </>
                  )}
                  {(selectedOption === sourceTranslationOptionsMapper.translation || selectedOption === sourceTranslationOptionsMapper.source_translation) && segment?.translation?.content && (
                    <div className="translation-content"
                         dangerouslySetInnerHTML={{__html: segment.translation.content}}/>
                  )}
                </div>
              </div>
            ))}

            {section?.sections?.map(nestedSection =>
              renderContent(nestedSection)
            )}
          </div>
        ))}
      </div>
    );
  };

  // main renderer
  return (
    <div className={"chapter"}>
      <ChapterHeader selectedOption={selectedOption} currentChapter={currentChapter} removeChapter={removeChapter}
                     setSelectedOption={setSelectedOption} textDetails={textDetails?.text_detail}
                     totalPages={totalPages}/>
      <Container fluid className="p-0">
        <div
          ref={containerRef}
          className="tibetan-text-container"
        >
          {/* Version loading spinner removed */}
          {contents?.map((item) => {
            return (<div key={item.id} className="content-item">
              {item.sections.map(segment => renderContent(segment))}
            </div>)
          })}
          {chapterContentIsLoading && (
            <div className="text-center my-3 my-md-4">
              <Spinner animation="border" role="output" size="sm">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
        </div>
        <Resources
          textId={textId}
          segmentId={selectedSegmentId}
          showPanel={showPanel}
          setShowPanel={handleSidebarToggle}
          setVersionId={handleVersionChange}
          versionId={versionId}
          addChapter={addChapter}
        />
      </Container>
    </div>
  );
};

export default Chapter;