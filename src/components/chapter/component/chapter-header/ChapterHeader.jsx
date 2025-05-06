import {getLanguageClass} from "../../../../utils/Constants.js";
import {BsBookmark, BsBookmarkFill} from "react-icons/bs";
import { LuPanelLeftOpen } from "react-icons/lu";
import {MdClose, MdOutlineVerticalSplit} from "react-icons/md";
import TranslationSource from "../translation-source-option-selector/TranslationSource.jsx";
import {useState} from "react";
import { usePanelContext } from "../../../../context/PanelContext.jsx";


const ChapterHeader = ({textDetails, selectedOption, setSelectedOption, totalPages, removeChapter, currentChapter, hasTranslation}) => {

  const [isBookmarked, setIsBookmarked] = useState(false);
  const { isTranslationSourceOpen, toggleTranslationSource, toggleLeftPanel, isLeftPanelOpen } = usePanelContext();
  const showTranslationSource = isTranslationSourceOpen;

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  return (
    <div className="header-overlay border">
      <LuPanelLeftOpen size={20} onClick={toggleLeftPanel} style={{ cursor: 'pointer' }}/>
      <div className={`text-container ${getLanguageClass(textDetails?.language)}`}>
        {textDetails?.title}
      </div>

      <div className="d-flex align-items-center mr-2">
        <button className="bookmark-button mr-2" onClick={() => setIsBookmarked(!isBookmarked)}>
          {isBookmarked ? <BsBookmarkFill size={20}/> : <BsBookmark size={20}/>}
        </button>
        <button
          className="bookmark-button" onClick={toggleTranslationSource}>
          <MdOutlineVerticalSplit size={20}/>
        </button>
        {showTranslationSource && (
          <TranslationSource
            selectedOption={selectedOption}
            onOptionChange={handleOptionChange}
            onClose={toggleTranslationSource}
            hasTranslation={hasTranslation}
          />
        )}
        {totalPages > 1 && (
          <button
            className="close-chapter bookmark-button" onClick={() => removeChapter(currentChapter)}>
            <MdClose size={20}/>
          </button>
        )}
      </div>
    </div>
  );
}

export default ChapterHeader