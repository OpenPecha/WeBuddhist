import { IoMdClose } from "react-icons/io";
import { IoAddCircleOutline, IoShareSocialSharp } from "react-icons/io5";
import { GoLinkExternal } from "react-icons/go";
import { useTranslate } from "@tolgee/react";
import { useQuery } from "react-query";
import { useEffect } from "react";
import "./RootText.scss";
import axiosInstance from "../../../../../../config/axios-config.js";
import {getLanguageClass} from "../../../../../../utils/Constants.js";
import {usePanelContext} from "../../../../../../context/PanelContext.jsx";

export const fetchRootTextData = async (segment_id) => {
  const {data} = await axiosInstance.get(`/api/v1/segments/${segment_id}/root_text`);
  return data;
}

const RootTextView = ({ segmentId, setIsRootTextView, expandedRootTexts, setExpandedRootTexts, addChapter, sectionindex }) => {
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
    if (event.target.classList && event.target.classList.contains('footnote-marker')) {
      event.stopPropagation();
      event.preventDefault();
      const footnoteMarker = event.target;
      const footnote = footnoteMarker.nextElementSibling;

      if (footnote && footnote.classList.contains('footnote')) {
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

  const toggleRootText = (rootTextId) => {
    setExpandedRootTexts(prev => ({
      ...prev,
      [rootTextId]: !prev[rootTextId]
    }));
  };
  return (
    <div>
      <div className="headerthing">
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
          {rootTextData && rootTextData.segment_root_mapping && 
           rootTextData.segment_root_mapping.length > 0 && (
            <div className="all-root-texts">
              {rootTextData.segment_root_mapping.map((rootText) => {
                const rootTextId = rootText.text_id;
                const isExpanded = expandedRootTexts[rootTextId];
                return (
                  <div key={rootTextId} className="root-text-list-item">
                    <h3 className={`root-text-title ${getLanguageClass(rootText.language)}`}>
                      {rootText.title}
                    </h3>
                    
                    {rootText.content && (
                      <div className="root-text-container">
                        <div 
                          className={`root-text-content ${getLanguageClass(rootText.language)} ${isExpanded ? '' : 'content-truncated'}`}
                        >
                          <div 
                            dangerouslySetInnerHTML={{ __html: rootText.content }}
                          />
                        </div>
                        
                        <div className="see-more-container">
                          <button 
                            className="see-more-link" 
                            onClick={() => toggleRootText(rootTextId)}
                          >
                            {isExpanded ? t('panel.showless') : t('panel.showmore')} 
                          </button>
                        </div>

                        <div className="root-text-actions">
                          <div className="root-text-buttons">
                            <div className="root-text-button"
                                 onClick={() => {
                                  addChapter({
                                   contentId: "", 
                                   versionId: "", 
                                   textId: rootText.text_id, 
                                   segmentId: rootText.segment_id,
                                   contentIndex: sectionindex !== null ? sectionindex : 0
                                 })
                                 closeResourcesPanel();
                                 }}>
                              <GoLinkExternal size={14} className="mr-1"/>
                              <span>{t("text.translation.open_text")}</span>
                            </div>

                            <div className="root-text-button">
                              <IoAddCircleOutline size={14} className="mr-1"/>
                              <span>{t("sheet.add_to_sheet")}</span>
                            </div>

                            <div className="root-text-button">
                              <IoShareSocialSharp size={14} className="mr-1"/>
                              <span>{t("common.share")}</span>
                            </div>
                          </div>
                        </div>
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