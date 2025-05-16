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
      const parsedChapters = JSON.parse(savedChapters);
      return parsedChapters.map(chapter => ({
        ...chapter,
        uniqueId: chapter.uniqueId || (chapter.segmentId ? chapter.segmentId : `content-${chapter.contentId}-version-${chapter.versionId}`)
      }));
    }
  
    const contentId = searchParams.get('contentId');
    const contentIndex = searchParams.get('contentIndex');
    const versionId = searchParams.get('versionId');
    const sectionId = searchParams.get('sectionId');
    const segmentId = searchParams.get('segmentId');
    
    if (contentId) {
      return [{
        contentId: contentId || "",
        contentIndex: contentIndex ? parseInt(contentIndex) : 0,
        versionId: versionId || "",
        sectionId: sectionId || "",
        segmentId: segmentId || "",
        uniqueId: segmentId || `content-${contentId}-version-${versionId}`
      }];
    }
    
  });

  useEffect(() => {
    sessionStorage.setItem('chapters', JSON.stringify(chapters));
    return () => {
      sessionStorage.removeItem('chapters')
    }
  }, [chapters]);

  const addChapter = (chapterInformation, currentChapter) => {
    setChapters(prevChapters => {
      if (prevChapters.length >= 3) return prevChapters;

      const newChapter = {
        ...chapterInformation,
        uniqueId: chapterInformation.segmentId || 
                 `content-${chapterInformation.contentId}-version-${chapterInformation.versionId}`
      };
  
      // Find the index of the current chapter
      const currentIndex = prevChapters.findIndex(chap => 
        chap.uniqueId === currentChapter.uniqueId
      );
  
      if (currentIndex === -1) {
        return [...prevChapters, newChapter];
      }
      // Insert the new chapter immediately after the current chapter
      const updatedChapters = [...prevChapters];
      updatedChapters.splice(currentIndex + 1, 0, newChapter);
  
      return updatedChapters;
    });
  };
  const removeChapter = (chapterInformation) => {
    const chapterIndex = chapters.findIndex(
      chapter => chapter.uniqueId === chapterInformation.uniqueId
    );
  
    if (chapterIndex !== -1) {
      const chapterContainers = document.querySelectorAll('.chapter-container');
      
      if (chapterIndex < chapterContainers.length) {
        const highlightedElements = chapterContainers[chapterIndex].querySelectorAll('.highlighted-segment');
        highlightedElements.forEach(element => {
          element.classList.remove('highlighted-segment');
        });
      }
    }
    
    setChapters(prevChapters =>
      prevChapters.filter(chapter => 
        chapter.uniqueId !== chapterInformation.uniqueId
      )
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
       {chapters.map((chapter) => (
  <div
    key={chapter.segmentId || `content-${chapter.contentId}-version-${chapter.versionId}`}
    className="chapter-container"
    data-chapter-id={chapter.segmentId || `content-${chapter.contentId}-version-${chapter.versionId}`}
    style={{width: `${100 / chapters.length}%`}}
  >
    <Chapter 
      addChapter={addChapter} 
      removeChapter={removeChapter} 
      updateChapter={updateChapter} 
      currentChapter={chapter} 
      totalPages={chapters.length}
    />
  </div>
))}
      </div>
  );
}
export default Chapters;
