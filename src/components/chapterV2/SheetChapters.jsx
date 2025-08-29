import { useParams } from "react-router-dom";
import Chapters from "./Chapters";
import ContentsChapter from "./chapter/ContentsChapter";
import SheetDetailPage from "../sheets/view-sheet/SheetDetailPage";

const SheetChapters = () => {
  const { username, sheetSlugAndId } = useParams();
  
  const initialChapters = [{
    type: 'sheet',
    sheetSlugAndId: sheetSlugAndId,
    username: username,
    segmentId: `sheet-${sheetSlugAndId}` 
  }];

  const renderChapter = (chapter, index, { versionId, addChapter, removeChapter, setVersionId }) => {
    if (chapter.type === 'sheet') {
      
      return (
        <SheetDetailPage
          addChapter={addChapter}
          currentChapter={chapter}
          setVersionId={setVersionId}
        />
      );
    } else {
      
      return (
        <ContentsChapter
          textId={chapter.textId}
          contentId={chapter.contentId}
          segmentId={chapter.segmentId}
          versionId={versionId}
          addChapter={addChapter}
          removeChapter={removeChapter}
          currentChapter={chapter}
          totalChapters={2} 
          setVersionId={setVersionId}
          isFromSheet={true}
        />
      );
    }
  };

  return (
    <Chapters 
      initialChapters={initialChapters}
      maxChapters={2}
      renderChapter={renderChapter}
    />
  );
};

export default SheetChapters;
