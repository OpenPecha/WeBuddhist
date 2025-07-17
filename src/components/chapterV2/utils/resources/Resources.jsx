import { useQuery } from "react-query";
import { IoMdClose } from "react-icons/io";
import { IoLanguage, IoNewspaperOutline } from "react-icons/io5";
import { FiInfo } from "react-icons/fi";
import { BiSearch, BiBookOpen } from "react-icons/bi";
import { useTranslate } from "@tolgee/react";
import "./Resources.scss";
import axiosInstance from "../../../../config/axios-config.js";
import { usePanelContext } from "../../../../context/PanelContext.jsx";
import { MENU_ITEMS } from "../../../../utils/constants.js";
import PropTypes from "prop-types";

export const fetchSidePanelData = async (segmentId) => {
  const { data } = await axiosInstance.get(`/api/v1/segments/${segmentId}/info`);
  return data;
};

const Resources = ({ segmentId }) => {
  const { isResourcesPanelOpen, closeResourcesPanel } = usePanelContext();
  const showPanel = isResourcesPanelOpen;
  const { t } = useTranslate();

  const { data: sidePanelData } = useQuery(
    ["sidePanel", segmentId],
    () => fetchSidePanelData(segmentId),
    {
      refetchOnWindowFocus: false,
    }
  );

  const renderMainPanel = () => (
    <>
      <div className="headerthing">
        <p className='mt-4 px-4 listtitle'>{t('panel.resources')}</p>
        <IoMdClose
          size={24}
          onClick={() => {
            closeResourcesPanel();
          }}
          className="close-icon"
        />
      </div>
      <div className="panel-content p-3">
        <p><FiInfo className="m-2" /> {t("side_nav.about_text")}</p>
        <p><BiSearch className='m-2' />{t("connection_panel.search_in_this_text")}</p>
        {sidePanelData?.segment_info?.translations > 0 && (
          <button type="button">
            <IoLanguage className="m-2" />
            {`${t("connection_pannel.translations")}
              (${sidePanelData.segment_info.translations})`}
          </button>
        )}
        {sidePanelData?.segment_info?.related_text && (sidePanelData?.segment_info?.related_text?.commentaries > 0 || sidePanelData?.segment_info?.related_text?.root_text > 0) && (
          <>
            <p className='textgreat'>{t("text.related_texts")}</p>
            <div className='related-texts-container'>
              {sidePanelData?.segment_info?.related_text?.commentaries > 0 && (
                <button className='related-text-item'>
                  <BiBookOpen className="m-2" />
                  {`${t("text.commentary")} (${sidePanelData?.segment_info?.related_text?.commentaries})`}
                </button>
              )}
              {sidePanelData?.segment_info?.related_text?.root_text > 0 && (
                <button className='related-text-item'>
                  <BiBookOpen className="m-2" />
                  {`${t("text.root_text")} (${sidePanelData?.segment_info?.related_text?.root_text})`}
                </button>
              )}
            </div>
          </>
        )}
        {sidePanelData?.segment_info?.resources?.sheets > 0 && (
          <>
            <p className='textgreat'>{t("panel.resources")}</p>
            <p>
              <IoNewspaperOutline className="m-2" />
              {` ${t("common.sheets")} (${sidePanelData?.segment_info?.resources?.sheets})`}
            </p>
          </>
        )}
        {MENU_ITEMS.map((item) => (
          <button
            type="button"
            key={item.label}
            className={item.isHeader ? 'textgreat' : ''}
          >
            {item.icon && <item.icon className='m-2' />}
            {t(`${item.label}`)}
          </button>
        ))}
      </div>
    </>
  );

  return (
    <>
      {showPanel && <button className="panel-backdrop" onClick={() => closeResourcesPanel()}></button>}
      <div className={`right-panel navbaritems ${showPanel ? 'show' : ''}`}>
        {renderMainPanel()}
      </div>
    </>
  );
};

export default Resources;
Resources.propTypes = {
  segmentId: PropTypes.string.isRequired,
  addChapter: PropTypes.func,
  handleClose: PropTypes.func
};