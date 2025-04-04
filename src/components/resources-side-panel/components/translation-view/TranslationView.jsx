import { IoMdClose } from "react-icons/io";
import { useTranslate } from "@tolgee/react";
import { getLanguageClass } from "../../../../utils/Constants.js";
import { GoLinkExternal } from "react-icons/go";
import "./TranslationView.scss";
import { useQuery } from "react-query";
import axiosInstance from "../../../../config/axios-config.js";

export const fetchtranslationdata=async(segment_id,skip=0,limit=10)=>{
  const {data} = await axiosInstance.get(`/api/v1/segments/${segment_id}/translations`, {
    params: {
      segment_id,
      skip,
      limit
    }
  });
  return data;
}

const TranslationView = ({
  segmentId,
  setIsTranslationView, 
  expandedTranslations, 
  setExpandedTranslations, 
  setVersionId, 
  versionId ,
  addChapter
}) => {
  const { t } = useTranslate();
  const {data: sidepaneltranslation} = useQuery(
    ["sidePaneltranslation",segmentId],
    () => fetchtranslationdata("2353849b-f8fa-43e4-850d-786b623d0130"), //send segmentId later todo
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20
    }
  );
  const languageMap = {
    "zh": "language.sanskrit",
    "bo": "language.tibetan",
    "en": "language.english",
    "ja": "language.japanese",
    "ko": "language.korean",
    "fr": "language.french",
    "de": "language.german",
    "bhu":"language.bhutanese",
    "mo":"language.mongolian",
    "sp":"language.spanish"
  }
  const groupedTranslations = sidepaneltranslation?.translations?.reduce((acc, translation) => {
    if (!acc[translation.language]) {
      acc[translation.language] = [];
    }
    acc[translation.language].push(translation);
    return acc;
  }, {});

  return (
    <div>
      <div className="headerthing">
        <p className='mt-4 px-4 listtitle'>{t('connection_pannel.translations')}</p>
        <IoMdClose
          size={24}
          onClick={() => setIsTranslationView(false)}
          className="close-icon"
        />
      </div>
      <div className="translation-content p-4">
        <div className="translations-list">
          {groupedTranslations && Object.entries(groupedTranslations).map(([language, translations]) => (
            <div key={language} className="language-group">
              <h3 className="language-title navbaritems">
                {t(languageMap[language])} <span className="translation-count">({translations.length})</span>
              </h3>
              {translations.map((translation, index) => {
                const translationKey = `${language}-${index}`;
                const isExpanded = expandedTranslations[translationKey] || false;
                
                return (
                  <div key={index} className="translation-item">
                    <span className={`translation-content ${getLanguageClass(translation.language)}`}>
                      <div 
                        className={`translation-text ${isExpanded ? 'expanded' : 'collapsed'}`}
                        dangerouslySetInnerHTML={{__html: translation.content}} 
                      />
                      {translation.content && translation.content.length > 0 && (
                        <button 
                          className="expand-button "
                          onClick={() => setExpandedTranslations(prev => ({
                            ...prev,
                            [translationKey]: !isExpanded
                          }))}
                        >
                          {isExpanded ? t('panel.showless') : t('panel.showmore')}
                        </button>
                      )}
                    </span>
                    <div className={` belowdiv ${getLanguageClass(translation.language)}`}>                    
                    <p className=" titles"> {translation?.title ? translation.title : ""}</p>                 
                    {translation.source && <p className="navbaritems"> {t("connection_panel.menuscript.source")}: { translation.source}</p> }   
                        
                        <p className="textgreat review navbaritems">{t("text.versions.information.review_history")}</p> 
                        <div className=" linkselect navbaritems">
                          <div className="linkicons" onClick={() => addChapter({contentId:"", versionId:translation.text_id})}>
                          <GoLinkExternal/>
                          {t("text.translation.open_text")}
                          </div>
                          {/* <p onClick={()=>setVersionId("translation.text_id")} className="selectss navbaritems">
                            {translation.text_id === versionId ? t("text.translation.current_selected") : t("common.select")}
                          </p> */}
                          <p onClick={()=>setVersionId(translation.text_id)} className="selectss navbaritems">
                           {t("common.select")}
                          </p>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TranslationView;
