import {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Chapters.scss';
import {useSearchParams} from "react-router-dom";
import Chapter from "./component/chapter/Chapter.jsx";

const Chapters = () => {
  const [searchParams] = useSearchParams();
  const [chapters, setChapters] = useState(() => {
    const savedChapters = sessionStorage.getItem('chapters');
    
    if (savedChapters) {
      return JSON.parse(savedChapters);
    }
    const contentId = searchParams.get('contentId');
    const contentIndex = searchParams.get('contentIndex');
    const versionId = searchParams.get('versionId');
    const sectionId = searchParams.get('sectionId');
    
    if (contentId) {
      return [{
        contentId: contentId || "",
        contentIndex: contentIndex ? parseInt(contentIndex) : 0,
        versionId: versionId || "",
        sectionId: sectionId || ""
      }];
    }
    
  });

  useEffect(() => {
    sessionStorage.setItem('chapters', JSON.stringify(chapters));
    return () => {
      sessionStorage.removeItem('chapters')
    }
  }, [chapters]);

  const addChapter = (chapterInformation) => {
    setChapters(prevChapters => {
      if (prevChapters.length >= 3) {
        return prevChapters;
      }
      const newChapter = {
        ...chapterInformation,
        textId: chapterInformation.textId || "",
        segmentId: chapterInformation.segmentId || "",
        contentIndex: chapterInformation.contentIndex !== undefined ? chapterInformation.contentIndex : 0
      };
      return [
        ...prevChapters,
        newChapter
      ];
    });
  };

  const removeChapter = (chapterInformation) => {
    setChapters(prevChapters =>
      prevChapters.filter(chapter => {
        if (chapterInformation.segmentId && chapter.segmentId) {
          return chapter.segmentId !== chapterInformation.segmentId;
        }
        // Fall back to the original logic for chapters without segmentId
        return !(chapter.contentId === chapterInformation.contentId && 
                chapter.versionId === chapterInformation.versionId);
      })
    );
  };

  const updateChapter = (currentChapter, updatedProperties) => {
    setChapters(prevChapters =>
      prevChapters.map(chapter => {
        // First check if we can match by segmentId
        if (currentChapter.segmentId && chapter.segmentId === currentChapter.segmentId) {
          return { ...chapter, ...updatedProperties };
        }
        // If no segmentId match, try to match by contentId
        else if (currentChapter.contentId && chapter.contentId === currentChapter.contentId) {
          return { ...chapter, ...updatedProperties };
        }
        return chapter;
      })
    );
  };

  return (
      <div className="chapters-container">
        {chapters.map((chapter, index) => (
          <div
            key={index}
            className="chapter-container"
            data-chapter-id={chapter.segmentId || `chapter-${index}`}
            style={{width: `${100 / chapters.length}%`}}
          >
            <Chapter addChapter={addChapter} removeChapter={removeChapter} updateChapter={updateChapter} currentChapter={chapter} totalPages={chapters.length}/>
          </div>
        ))}
      </div>
  );
}
export default Chapters;
