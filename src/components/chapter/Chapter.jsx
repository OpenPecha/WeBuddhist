import {useEffect, useRef, useState} from 'react';
import {Container, Spinner} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Chapter.scss';
import axiosInstance from "../../config/axios-config.js";
import {getLanguageClass, sourceTranslationOptionsMapper} from '../../utils/Constants.js';
import {BsBookmark, BsBookmarkFill} from "react-icons/bs";
import {MdOutlineVerticalSplit, MdClose} from "react-icons/md";
import {useQuery} from 'react-query';
import {useLocation, useSearchParams} from "react-router-dom";
import TranslationSource from './localcomponent/translation-source/TranslationSource.jsx';
import Resources from "../resources-side-panel/Resources.jsx";

export const fetchTextDetails = async (text_id, content_id, versionId, skip, limit) => {
  const {data} = await axiosInstance.post(`/api/v1/texts/${text_id}/details`, {
    content_id: content_id ?? "",
    version_id: versionId ?? "",
    limit,
    skip
  });
  return data;
}
const Chapter = ({addChapter, removeChapter, currentChapter, totalChapters}) => {
  const [contents, setContents] = useState([]);
  const [skip, setSkip] = useState(0);
  const [selectedSegmentId, setSelectedSegmentId] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showTranslationSource, setShowTranslationSource] = useState(false);
  const [selectedOption, setSelectedOption] = useState(sourceTranslationOptionsMapper.source_translation);
  const containerRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPanel, setShowPanel] = useState(false);
  const [versionId, setVersionId] = useState(currentChapter.versionId); // TODO: check whether this is really required

  const textId = searchParams.get("text_id");
  const contentId = currentChapter.contentId

  const {data: textDetails, isLoading: chapterContentIsLoading} = useQuery(
    ["chapter", textId, skip, versionId],
    () => fetchTextDetails(textId, contentId, versionId, skip, 40),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20
    }
  );
  useEffect(() => {
    if (!textDetails) return;

    setContents(prevState => {
      return [...prevState, ...textDetails.contents]
    });
  }, [textDetails]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("chapters")
    }
  }, [])

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
  }, [skip, chapterContentIsLoading]);


  // helper function

  const handleVersionChange = (newVersionId) => {
    setVersionId(newVersionId);
  };

  const handleSidebarToggle = (isOpen) => {
    setShowPanel(isOpen);
  };
  const handleScroll = () => {
    if (!containerRef.current) return;
    const {scrollTop, scrollHeight, clientHeight} = containerRef.current;
    const scrollPosition = (scrollTop + clientHeight) / scrollHeight;
    if (scrollPosition >= 0.75 && !chapterContentIsLoading) {
      setSkip(prevState => prevState + 1);
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
          <button className="bookmark-button mr-3" onClick={() => setIsBookmarked(!isBookmarked)}>
            {isBookmarked ? <BsBookmarkFill size={20}/> : <BsBookmark size={20}/>}
          </button>
          <button
            className="bookmark-button" onClick={(e) => setShowTranslationSource(!showTranslationSource)}>
            <MdOutlineVerticalSplit size={20}/>
          </button>
          {showTranslationSource && (
            <TranslationSource
              selectedOption={selectedOption}
              onOptionChange={handleOptionChange}
              onClose={() => setShowTranslationSource(false)}
            />
          )}
          {totalChapters > 1 && (
            <button
              className="close-chapter bookmark-button" onClick={() => removeChapter(currentChapter)}>
              <MdClose size={20}/>
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderContent = (item) => {
    return (
      <div key={item.id} className={`section ${getLanguageClass(textDetails?.text_detail?.language)} `}>
        {item.title && <h4>{item.title}</h4>}

        {item?.segments?.map(segment => (
          <div
            key={segment.id}
            className="text-segment mb-4 "
            onClick={() => {
              setSelectedSegmentId(segment.segment_id);
              handleSidebarToggle(true);
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
            <h4>{section.title}</h4>
            {section?.segments?.map(segment => (
              <div
                key={segment.id}
                className="text-segment  mb-4"
                onClick={() => {
                  setSelectedSegmentId(segment.segment_id);
                  handleSidebarToggle(true);
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
    <>
      <HeaderOverlay/>
      <Container fluid className="p-0">
        <div
          ref={containerRef}
          className="tibetan-text-container"
        >
          {/* Version loading spinner removed */}
          {contents?.map((item) => {
            return (<div key={item.id}>
              {item.segments.map(segment => renderContent(segment))}
            </div>)
          })}
          {chapterContentIsLoading && (
            <div className="text-center my-4">
              <Spinner animation="border" role="output">
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
    </>
  );
};

const Chapters = () => {
  const location = useLocation();
  const [chapters, setChapters] = useState(() => {
    const savedChapters = sessionStorage.getItem('chapters');
    return savedChapters ? JSON.parse(savedChapters) : [location.state?.chapterInformation] || [{
      contentId: "",
      versionId: ""
    }]
  });

  useEffect(() => {
    sessionStorage.setItem('chapters', JSON.stringify(chapters));
  }, [chapters]);

  const addChapter = (chapterInformation) => {
    setChapters(prevChapters => {
      if (prevChapters.length >= 3) {
        return prevChapters;
      }
      return [
        ...prevChapters,
        chapterInformation
      ];
    });
  };

  const removeChapter = (chapterInformation) => {
    setChapters(prevChapters =>
      prevChapters.filter(chapter =>
        !(chapter.contentId === chapterInformation.contentId && chapter.versionId === chapterInformation.versionId)
      )
    );
  };

  return (
    <div className="chapters-container">
      {chapters.map((chapter, index) => (
        <div
          key={index}
          className=" chapter-container"
          style={{width: `${100 / chapters.length}%`}}
        >
          <Chapter addChapter={addChapter} removeChapter={removeChapter} currentChapter={chapter} totalChapters={chapters.length}/>
        </div>
      ))}
    </div>
  );
}
export default Chapters;
