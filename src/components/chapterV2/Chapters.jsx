import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ContentsChapter from "./chapter/ContentsChapter";

const Chapters = () => {
  const [searchParams] = useSearchParams();
  const [chapters, setChapters] = useState(() => 
    {
    const savedChapters = sessionStorage.getItem('chapters');
    if (savedChapters) {
      const parsedChapters = JSON.parse(savedChapters);
      return parsedChapters.map(chapter => ({
        ...chapter,
        uniqueId: chapter.uniqueId || (chapter.segmentId ? chapter.segmentId : chapter.contentId)
      }));
    }

    const textId = searchParams.get("text_id");
    const contentId = searchParams.get("content_id");
    const segmentId = searchParams.get("segment_id");

    if (textId || contentId) {
      return [{
        textId: textId || "",
        contentId: contentId || "",
        segmentId: segmentId || "",
        uniqueId: segmentId || contentId
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
        ...chapterInformation,
        uniqueId: chapterInformation.segmentId || chapterInformation.contentId
      };

      const currentIndex = prev.findIndex(chap => chap.uniqueId === currentChapter.uniqueId);
      if (currentIndex === -1) {
        return [...prev, newChapter];
      }
      const updatedChapters = [...prev];
      updatedChapters.splice(currentIndex + 1, 0, newChapter);
      return updatedChapters;
    });
  };

  const removeChapter = (chapterToRemove) => {
    setChapters(prev => prev.filter(chap => chap.uniqueId !== chapterToRemove.uniqueId));
  };

  return (
    <div className="chapters-container">
      {chapters.map((chapter) => (
        <div
          key={chapter.uniqueId}
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