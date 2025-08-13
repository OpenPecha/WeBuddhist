import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import ContentsChapter from "./chapter/ContentsChapter";
import "./Chapters.scss";

const Chapters = () => {
  const [searchParams] = useSearchParams();
  const [versionId, setVersionId] = useState(() => {
    const savedVersionId = sessionStorage.getItem('versionId');
    return savedVersionId || '';
  });
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
        contentId: contentId,
        segmentId: segmentId 
      }];
    }
  });

  useEffect(() => {
    sessionStorage.setItem('chapters', JSON.stringify(chapters));
    sessionStorage.setItem('versionId', versionId || '');
    return () => {
      sessionStorage.removeItem('chapters');
      sessionStorage.removeItem('versionId');
    };
  }, [chapters, versionId]);

  const addChapter = useCallback((chapterInformation, currentChapter) => {
    setChapters(prev => {
      if (prev.length >= 3) return prev;
      const currentIndex = prev.findIndex(chap => chap.segmentId === currentChapter.segmentId);
      if (currentIndex === -1) {
        return [...prev, chapterInformation];
      }
      const updatedChapters = [...prev];
      updatedChapters.splice(currentIndex + 1, 0, chapterInformation);
      return updatedChapters;
    });
  }, []);

  const removeChapter = useCallback((chapterToRemove) => {
    setChapters(prev => prev.filter(chap => chap.segmentId !== chapterToRemove.segmentId));
  }, []);

  return (
    <div className="chapters-container">
      {chapters.map((chapter, index) => (
        <div
          key={`${chapter.textId}-${chapter.contentId || 'no-content'}-${chapter.segmentId || 'no-segment'}`}
          className="chapter-container"
          style={{ width: `${100 / chapters.length}%` }}
        >
            <ContentsChapter
              textId={chapter.textId}
              contentId={chapter.contentId}
              segmentId={chapter.segmentId}
              versionId={versionId}
              addChapter={addChapter}
              removeChapter={removeChapter}
              currentChapter={chapter}
              totalChapters={chapters.length}
              setVersionId={setVersionId}
            />
        </div>
      ))}
    </div>
  );
};

export default Chapters;