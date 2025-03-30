import {useEffect, useRef, useState} from 'react';
import {Container, Spinner} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Chapter.scss';
import axiosInstance from "../../config/axios-config.js";
import {getLanguageClass, sourceTranslationOptionsMapper} from '../../utils/Constants.js';
import {BsBookmark, BsBookmarkFill} from "react-icons/bs";
import {MdOutlineVerticalSplit} from "react-icons/md";
import {useQuery} from 'react-query';
import {useSearchParams} from "react-router-dom";
import TranslationSource from './localcomponent/translation-source/TranslationSource.jsx';
import Resources from "../resources-side-panel/Resources.jsx";

export const fetchTextDetails = async (text_id, content_id, versionId, skip, limit) => {
  const {data} = await axiosInstance.post(`/api/v1/texts/${text_id}/details`, {
    content_id: content_id ?? "",
    version_id: versionId ?? ""
  }, {
    params: {
      limit,
      skip
    }
  });
  return data;
}
const Chapter = () => {
  const [segments, setSegments] = useState([]);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showTranslationSource, setShowTranslationSource] = useState(false);
  const [selectedOption, setSelectedOption] = useState(sourceTranslationOptionsMapper.source_translation);
  const containerRef = useRef(null);
  const [searchParams] = useSearchParams();

  const textId = searchParams.get("text_id");
  const contentId = searchParams.get("content_id");
  const versionId = searchParams.get("version_id");
  const {data: textDetails} = useQuery(
    ["textsDetails", textId, page],
    () => fetchTextDetails(textId, contentId, versionId, page, 40),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 1000 * 60 * 20
    }
  );

  useEffect(() => {
    if (contents.length) {
      setContents(prevState => {
        return [
          ...prevState,
          ...textDetails.contents
        ]
      })
    } else if (textDetails) {
      setContents(prevState => {
        return [...prevState, ...textDetails.contents]
      })
    }
    setLoading(false);
  }, [textDetails]);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [page, loading]);


  // helper function
  const handleScroll = () => {
    if (!containerRef.current) return;
    const {scrollTop, scrollHeight, clientHeight} = containerRef.current;
    const scrollPosition = (scrollTop + clientHeight) / scrollHeight;
    if (scrollPosition >= 0.75 && !loading) {
      setLoading(true);
      setPage(prevState => prevState + 1);
    }
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const HeaderOverlay = () => {
    return (
      <div className="header-overlay">
        <div className={`text-container ${getLanguageClass(textDetails?.text_detail?.language)}`}>
          {textDetails?.text_detail?.title}
        </div>

        <div className="d-flex align-items-center">
          <button
            className="bookmark-button mr-3"
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            {isBookmarked ? <BsBookmarkFill size={20}/> : <BsBookmark size={20}/>}
          </button>

          <div style={{position: 'relative'}}>
            <button
              className="bookmark-button"
              onClick={(e) => {
                e.preventDefault();
                setShowTranslationSource(!showTranslationSource);
              }}
            >
              <MdOutlineVerticalSplit size={20}/>
            </button>
            {showTranslationSource && (
              <TranslationSource
                selectedOption={selectedOption}
                onOptionChange={handleOptionChange}
                onClose={() => setShowTranslationSource(false)}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = (item) => {
    return (
      <div key={item.id} className="section navbaritems ">
        {item.title && <h2>{item.title}</h2>}

        {item?.segments?.map(segment => (
          <div
            key={segment.id}
            className="text-segment listtitle mb-4"
            onClick={() => {
              setSelectedSegmentId(segment.segment_id);
              setShowPanel(true);
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
            <h3>{section.title}</h3>

            {section?.segments?.map(segment => (
              <div
                key={segment.id}
                className="text-segment listtitle mb-4"
                onClick={() => {
                  setSelectedSegmentId(segment.segment_id);
                  setShowPanel(true);
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
    <>
      <HeaderOverlay/>
      <Container fluid className="p-0">
        <div
          ref={containerRef}
          className="tibetan-text-container"
        >
          {contents?.map((item) => {
            return (<div key={item.id}>
              {item.segments.map(segment => renderContent(segment))}
            </div>)
          })}
          {loading && (
            <div className="text-center my-4">
              <Spinner animation="border" role="output">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
          {segments.length > 0 && (
            <div className="text-center text-muted my-4">
              End of content
            </div>
          )}
        </div>
        <Resources 
          textId={textId} 
          segmentId={selectedSegmentId}
          showPanel={showPanel} 
          setShowPanel={setShowPanel}
        />
      </Container>
    </>
  );
};

export default Chapter;
