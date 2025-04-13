import {LANGUAGE, mapLanguageCode, menuItems} from "../../utils/Constants.js";
import axiosInstance from "../../config/axios-config.js";
import {useQuery} from "react-query";
import {IoMdClose} from "react-icons/io";
import { IoLanguage, IoNewspaperOutline,} from "react-icons/io5";
import { BsWindowFullscreen} from "react-icons/bs";
import {FiInfo, FiList} from "react-icons/fi";
import {BiSearch, BiBookOpen} from "react-icons/bi";
import {useState} from "react";
import {useTranslate} from "@tolgee/react";
import ShareView from "./components/share-view/ShareView.jsx";
import TranslationView from "./components/translation-view/TranslationView.jsx";
import CommentaryView from "./components/related-texts/RelatedTexts.jsx";
import "./Resources.scss"

export const fetchSidePanelData = async (text_id) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const {data} = await axiosInstance.get(`/api/v1/texts/${text_id}/infos`, {
    params: {
      language,
      text_id
    }
  });
  return data;
};

const Resources = ({textId, segmentId, showPanel, setShowPanel, setVersionId, versionId, addChapter}) => {
  const [expandedCommentaries, setExpandedCommentaries] = useState({});
  const [expandedTranslations, setExpandedTranslations] = useState({});
  const [activeView, setActiveView] = useState("main");


  const {t} = useTranslate();

  const {data: sidePanelData} = useQuery(
    ["sidePanel", textId],
    () => fetchSidePanelData(textId),
    {
      refetchOnWindowFocus: false,
    }
  );

  const renderMainPanel = () => {
    return <>
      <div className="headerthing">
        <p className='mt-4 px-4 listtitle'>{t('panel.resources')}</p>
        <IoMdClose
          size={24}
          onClick={() => {
            setShowPanel(false);
            setActiveView("main");
          }}
          className="close-icon"
        />
      </div>
      <div className="panel-content p-3">
        <p><FiInfo className="m-2"/> {t("side_nav.about_text")}</p>
        <p><FiList className='m-2'/>{t("text.table_of_contents")}</p>
        <p><BiSearch className='m-2'/>{t("connection_panel.search_in_this_text")}</p>

        {sidePanelData?.text_infos?.translations > 0 && (
          <p onClick={() => setActiveView("translation")}>
            <IoLanguage className="m-2"/>
            {`${t("connection_pannel.translations")} (${sidePanelData.text_infos.translations})`}
          </p>
        )}

        {sidePanelData?.text_infos?.related_texts?.length > 0 && (
          <>
            <p className='textgreat'>{t("text.related_texts")}</p>
            <div className='related-texts-container'>
              {sidePanelData.text_infos.related_texts.map((data, index) => (
                <p key={index} className='related-text-item' onClick={() => setActiveView("commentary")}>
                  <BiBookOpen className="m-2"/>
                  {`${data.title} (${data.count})`}
                </p>
              ))}
            </div>
          </>
        )}

        {sidePanelData?.text_infos?.sheets > 0 && (
          <>
            <p className='textgreat'>{t("panel.resources")}</p>
            <p>
              <IoNewspaperOutline className="m-2"/>
              {` ${t("common.sheets")} (${sidePanelData.text_infos.sheets})`}
            </p>
          </>
        )}

        {sidePanelData?.text_infos?.web_pages > 0 && (
          <p>
            <BsWindowFullscreen className="m-2"/>
            {` ${t("text.web_pages")} (${sidePanelData.text_infos.web_pages})`}
          </p>
        )}

        {menuItems.map((item) => (
          <div
            key={item.label}
            className={item.isHeader ? 'textgreat' : ''}
            onClick={() => {
              if (item.label === 'common.share') {
                setActiveView("share");
              }
            }}
          >
            <p>
              {item.icon && <item.icon className='m-2'/>}
              {t(`${item.label}`)}
            </p>
          </div>
        ))}
      </div>
    </>

  }

  const renderSidePanel = () => {
    switch (activeView) {
      case "share":
        return (
          <ShareView
            sidePanelData={sidePanelData}
            setIsShareView={setActiveView}
          />
        );
      case "translation":
        return (
          <TranslationView
            segmentId={segmentId}
            setIsTranslationView={setActiveView}
            expandedTranslations={expandedTranslations}
            setExpandedTranslations={setExpandedTranslations}
            setVersionId={setVersionId}
            versionId={versionId}
            addChapter={addChapter}
          />
        );
      case "commentary":
        return (
          <CommentaryView
            segmentId={segmentId}
            setIsCommentaryView={setActiveView}
            expandedCommentaries={expandedCommentaries}
            setExpandedCommentaries={setExpandedCommentaries}
            addChapter={addChapter}
          />
        );
      default:
        return renderMainPanel();
    }
  };

  return(
    <>
      {showPanel && <div className="panel-backdrop" onClick={() => setShowPanel(false)}></div>}
      <div className={`right-panel navbaritems ${showPanel ? 'show' : ''}`}>
        {renderSidePanel()}
      </div>
    </>
  )
}

export default Resources;