import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ContentsChapter from "./chapter/ContentsChapter";
import "./Chapters.scss";

const Chapters = () => {
  const [searchParams] = useSearchParams();
  const [chapters, setChapters] = useState(() => 
    {
    const savedChapters = sessionStorage.getItem('chapters');
    if (savedChapters) {
      const parsedChapters = JSON.parse(savedChapters);
      return parsedChapters.map(chapter => ({
        ...chapter
      }));
    }
    const textId = searchParams.get("text_id");
    const contentId = searchParams.get("content_id");
    const segmentId = searchParams.get("segment_id");

    if (textId) {
      return [{
        textId: textId,
        contentId: contentId ,
        segmentId: segmentId 
      }];
    }
    return [];
  });

  useEffect(() => {
    sessionStorage.setItem('chapters', JSON.stringify(chapters));
    return () => {
      sessionStorage.removeItem('chapters');
    };
  }, [chapters]);

  const addChapter = (chapterInformation, currentChapter) => {
    setChapters(prev => {
      if (prev.length >= 3) return prev;
      const newChapter = {
        ...chapterInformation
      };

      const currentIndex = prev.findIndex(chap => chap.segmentId === currentChapter.segmentId);
      if (currentIndex === -1) {
        return [...prev, newChapter];
      }
      const updatedChapters = [...prev];
      updatedChapters.splice(currentIndex + 1, 0, newChapter);
      return updatedChapters;
    });
  };

  const removeChapter = (chapterToRemove) => {
    setChapters(prev => prev.filter(chap => chap.segmentId !== chapterToRemove.segmentId));
  };

  return (
    <div className="chapters-container">
      {chapters.map((chapter, index) => (
        <div
          key={index}
          className="chapter-container"
          style={{ width: `${100 / chapters.length}%` }}
        >
            <ContentsChapter
              textId={chapter.textId}
              contentId={chapter.contentId}
              segmentId={chapter.segmentId}
              addChapter={addChapter}
              removeChapter={removeChapter}
              currentChapter={chapter}
              totalChapters={chapters.length}
            />
        </div>
      ))}
    </div>
  );
};

export default Chapters;