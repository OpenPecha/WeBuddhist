import { IoMdClose } from "react-icons/io";
import { IoAddCircleOutline, IoShareSocialSharp } from "react-icons/io5";
import { GoLinkExternal } from "react-icons/go";
import { useTranslate } from "@tolgee/react";
import { useQuery } from "react-query";
import "./RelatedTexts.scss";
import axiosInstance from "../../../../../../config/axios-config.js";
import {usePanelContext} from "../../../../../../context/PanelContext.jsx";
import {getLanguageClass} from "../../../../../../utils/helperFunctions.jsx";
import PropTypes from "prop-types";

export const fetchCommentaryData = async (segment_id, skip = 0, limit = 10) => {
  const {data} = await axiosInstance.get(`/api/v1/segments/${segment_id}/commentaries`, {
    params: {
      skip,
      limit
    }
  });
  return data;
}
const CommentaryView = ({ segmentId, setIsCommentaryView, expandedCommentaries, setExpandedCommentaries, addChapter }) => {
  const { t } = useTranslate();
  const { closeResourcesPanel } = usePanelContext();
  const {data: segmentCommentaries} = useQuery(
    ["relatedTexts", segmentId],
    () => fetchCommentaryData(segmentId),
    {
      refetchOnWindowFocus: false,
    }
  );
  const toggleCommentary = (textId) => {
    setExpandedCommentaries(prev => ({
      ...prev,
      [textId]: !prev[textId]
    }));
  };

  return (
    <div>
      <div className="headerthing">
        <p className="mt-4 px-4 listtitle">
          {t("text.commentary")}
          {segmentCommentaries?.commentaries?.length > 0 ? 
            ` (${segmentCommentaries.commentaries.length})` : ''}
        </p>
        <IoMdClose
          size={24}
          onClick={() => setIsCommentaryView("main")}
          className="close-icon"
        />
      </div>
      <div className="translation-content p-4">
        <div className="commentaries-list">
          {segmentCommentaries && segmentCommentaries.commentaries && 
           segmentCommentaries.commentaries.length > 0 && (
            <div>
              {segmentCommentaries.commentaries.map((commentary) => {
                const textId = commentary.text_id;
                const segmentId = commentary.segment_id;
                const isExpanded = expandedCommentaries[textId];  
                return (
                  <div key={textId} className="commentary-list-item">
                    <h3 className={`commentary-title ${getLanguageClass(commentary.language)}`}>
                      {commentary.title} {commentary.count && `(${commentary.count})`}
                    </h3>
                    
                    {commentary.content && (
                      <div className="commentary-container">
                        <div 
                          className={`commentary-content ${getLanguageClass(commentary.language)} ${isExpanded ? '' : 'content-truncated'}`}
                        >
                          <div 
                            dangerouslySetInnerHTML={{ __html: commentary.content }}
                          />
                        </div>
                        
                        <div className="see-more-container">
                          <button 
                            className="see-more-link" 
                            onClick={() => toggleCommentary(textId)}
                          >
                            {isExpanded ? t('panel.showless') : t('panel.showmore')} 
                          </button>
                        </div>

                        <div className="commentary-actions">
                          <div className="commentary-buttons">
                            <button className="commentary-button"
                                 onClick={() => {
                                   addChapter({
                                     contentId: "", 
                                     textId: textId, 
                                     segmentId: segmentId,
                                   });
                                   closeResourcesPanel();
                                 }}>

                              <GoLinkExternal size={14} className="mr-1"/>
                              <span>{t("text.translation.open_text")}</span>
                            </button>

                            <div className="commentary-button">
                              <IoAddCircleOutline size={14} className="mr-1"/>
                              <span>{t("sheet.add_to_sheet")}</span>
                            </div>

                            <div className="commentary-button">
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

export default CommentaryView;
CommentaryView.propTypes = {
  segmentId: PropTypes.string.isRequired, 
  setIsCommentaryView: PropTypes.func.isRequired, 
  expandedCommentaries: PropTypes.object.isRequired, 
  setExpandedCommentaries: PropTypes.func.isRequired, 
  addChapter: PropTypes.func, 
}