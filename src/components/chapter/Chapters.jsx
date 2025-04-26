import {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Chapters.scss';
import {useLocation} from "react-router-dom";
import Chapter from "./component/chapter/Chapter.jsx";

const Chapters = () => {
  const location = useLocation();
  const [chapters, setChapters] = useState(() => {
    const savedChapters = sessionStorage.getItem('chapters');
    return savedChapters ? JSON.parse(savedChapters) : [location.state?.chapterInformation] || [{
      contentId: "",
      contentIndex: 0,
      versionId: ""
    }]
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
        segmentId: chapterInformation.segmentId || ""
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
        if (currentChapter.segmentId && chapter.segmentId === currentChapter.segmentId) {
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
            style={{width: `${100 / chapters.length}%`}}
          >
            <Chapter addChapter={addChapter} removeChapter={removeChapter} updateChapter={updateChapter} currentChapter={chapter} totalPages={chapters.length}/>
          </div>
        ))}
      </div>
  );
}
export default Chapters;
