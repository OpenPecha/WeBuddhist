import {LANGUAGE, mapLanguageCode, menuItems} from "../../utils/Constants.js";
import axiosInstance from "../../config/axios-config.js";
import {useQuery} from "react-query";
import {IoMdCheckmark, IoMdClose} from "react-icons/io";
import {IoCopy, IoLanguage, IoNewspaperOutline} from "react-icons/io5";
import {BsFacebook, BsTwitter, BsWindowFullscreen} from "react-icons/bs";
import {FiInfo, FiList} from "react-icons/fi";
import {BiBook, BiSearch} from "react-icons/bi";
import {useState} from "react";
import {useTranslate} from "@tolgee/react";
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
const Resources = ({textId, showPanel, setShowPanel}) => {
  const [isShareView, setIsShareView] = useState(false);
  const [copied, setCopied] = useState(false);

  const {t} = useTranslate();

  const {data: sidePanelData} = useQuery(
    ["sidePanel", textId],
    () => fetchSidePanelData(textId),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20
    }
  );

  const renderShareView = () => {
    return (
      <div>
        <div className="headerthing">
          <p className='mt-4 px-4 listtitle'>{t('panel.resources')}</p>
          <IoMdClose
            size={24}
            onClick={() => setIsShareView(false)}
            className="close-icon"
          />
        </div>
        <div className="share-content p-3">
          <p className="mb-3 textgreat ">{t('text.share_link')}</p>
          <div className="share-url-container p-3 mb-3">
            <p className="share-url text-truncate">{sidePanelData?.text_infos?.short_url}</p>
            <button
              className="copy-button"
              onClick={() => {
                navigator.clipboard.writeText(sidePanelData?.text_infos?.short_url);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 3000);
              }}
            >
              {copied ? <IoMdCheckmark size={16}/> : <IoCopy size={16}/>}
            </button>
          </div>
          <p className="textgreat">{t('text.more_options')}</p>
          <div className="social-share-buttons">
            <p className="social-button">
              <BsFacebook className="social-icon"/>{t('common.share_on_fb')}
            </p>
            <p className="social-button">
              <BsTwitter className="social-icon"/>{t('common.share_on_x')}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderSidePanel = () => {
    return (
      <div className={`right-panel navbaritems ${showPanel ? 'show' : ''}`}>
        <div>
          {isShareView ? renderShareView() : (
            <>
              <div className="headerthing">
                <p className='mt-4 px-4 listtitle'>{t('panel.resources')}</p>
                <IoMdClose
                  size={24}
                  onClick={() => setShowPanel(false)}
                  className="close-icon"
                />
              </div>
              <div className="panel-content p-3">
                <p><FiInfo className="m-2"/> {t("side_nav.about_text")}</p>
                <p><FiList className='m-2'/>{t("text.table_of_contents")}</p>
                <p><BiSearch className='m-2'/>{t("connection_panel.search_in_this_text")}</p>

                {sidePanelData?.text_infos?.translations > 0 && (
                  <p>
                    <IoLanguage className="m-2"/>
                    {`${t("connection_pannel.translations")} (${sidePanelData.text_infos.translations})`}
                  </p>
                )}

                {sidePanelData?.text_infos?.related_texts?.length > 0 && (
                  <>
                    <p className='textgreat'>{t("text.related_texts")}</p>
                    <div className='related-texts-container'>
                      {sidePanelData.text_infos.related_texts.map((data, index) => (
                        <p key={index} className='related-text-item'>
                          <BiBook className="m-2"/>
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
                    className={item.isHeader ? 'textgreat' : ' '}
                    onClick={() => {
                      if (item.label === 'common.share') {
                        setIsShareView(true);
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
          )}
        </div>
      </div>
    );
  };
  return(
    renderSidePanel()
  )
}

export default Resources;