import { IoMdClose } from "react-icons/io";
// import { IoAddCircleOutline, IoShareSocialSharp } from "react-icons/io5";
import { IoChevronBackSharp } from "react-icons/io5";
import { GoLinkExternal } from "react-icons/go";
import { useTranslate } from "@tolgee/react";
import { useQuery } from "react-query";
import { useEffect } from "react";
import "./RootText.scss";
import axiosInstance from "../../../../../../config/axios-config.js";
import {usePanelContext} from "../../../../../../context/PanelContext.jsx";
import {getLanguageClass} from "../../../../../../utils/helperFunctions.jsx";
import PropTypes from "prop-types";
import TextExpand from "../../../../../commons/expandtext/TextExpand.jsx";

export const fetchRootTextData = async (segment_id) => {
  const {data} = await axiosInstance.get(`/api/v1/segments/${segment_id}/root_text`);
  return data;
}

const RootTextView = ({ segmentId, setIsRootTextView, addChapter, currentChapter, handleNavigate }) => {
  const { t } = useTranslate();
  const {closeResourcesPanel} = usePanelContext();
  const {data: rootTextData} = useQuery(
    ["rootTexts", segmentId],
    () => fetchRootTextData(segmentId),
    {
      refetchOnWindowFocus: false,
    }
  );
  
  const handleFootnoteClick = (event) => {
    if (event.target.classList?.contains('footnote-marker')) {
      event.stopPropagation();
      event.preventDefault();
      const footnoteMarker = event.target;
      const footnote = footnoteMarker.nextElementSibling;

      if (footnote?.classList.contains('footnote')) {
        footnote.classList.toggle('active');
      }
      return false;
    }
  };
  
  useEffect(() => {
    const rootTextElement = document.querySelector('.root-texts-list');
    if (rootTextElement) {
      rootTextElement.addEventListener('click', handleFootnoteClick);
    }
    
    return () => {
      const rootTextElement = document.querySelector('.root-texts-list');
      if (rootTextElement) {
        rootTextElement.removeEventListener('click', handleFootnoteClick);
      }
    };
  }, [rootTextData]);

  return (
    <div>
      <div className="headerthing">
        <IoChevronBackSharp size={24} onClick={() => handleNavigate()} className="back-icon" />
        <p className="mt-4 px-4 listtitle">
          {t("text.root_text")}
          {rootTextData?.segment_root_mapping?.length > 0 ? 
            ` (${rootTextData.segment_root_mapping.length})` : ''}
        </p>
        <IoMdClose
          size={24}
          onClick={() => setIsRootTextView("main")}
          className="close-icon"
        />
      </div>
      <div className="translation-content p-4">
        <div className="root-texts-list">
          {rootTextData?.segment_root_mapping?.length > 0 && (
            <div className="all-root-texts">
              {rootTextData.segment_root_mapping.map((rootText) => {
                const textId = rootText.text_id;
                const language=rootText.language;
                return (
                  <div key={textId} className="root-text-list-item">
                    <h3 className={`root-text-title ${getLanguageClass(language)}`}>
                      {rootText.title} {rootText.count && `(${rootText.count})`}
                    </h3>
                    {rootText.segments && (
                      <div className="root-text-container">
                          {rootText.segments && rootText.segments.map((item, idx) => (
                          <div key={idx}>
                          <TextExpand language={language} maxLength={250}>
                            {item.content}
                          </TextExpand>
                          <div className="root-text-buttons">
                            <button className="root-text-button"
                                 onClick={() => {
                                   addChapter({
                                     textId: textId, 
                                     segmentId: item.segment_id,
                                   }, currentChapter);
                                   closeResourcesPanel();
                                 }}>
                              <GoLinkExternal size={14} className="mr-1"/>
                              <span>{t("text.translation.open_text")}</span>
                            </button>

                            {/* <div className="root-text-button">
                              <IoAddCircleOutline size={14} className="mr-1"/>
                              <span>{t("sheet.add_to_sheet")}</span>
                            </div>

                            <div className="root-text-button">
                              <IoShareSocialSharp size={14} className="mr-1"/>
                              <span>{t("common.share")}</span>
                            </div> */}
                          </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RootTextView;
RootTextView.propTypes = {
  segmentId: PropTypes.string.isRequired, 
  setIsRootTextView: PropTypes.func.isRequired, 
  addChapter: PropTypes.func, 
  currentChapter: PropTypes.object, 
  handleNavigate: PropTypes.func.isRequired,
} 