import { useState } from "react";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { IoCopy } from "react-icons/io5";
import { BsFacebook, BsTwitter } from "react-icons/bs";
import { useTranslate } from "@tolgee/react";
import "./ShareView.scss";
import { useQuery } from "react-query";
import axiosInstance from "../../../../../../config/axios-config.js";
import PropTypes from "prop-types";
import { IoChevronBackSharp } from "react-icons/io5";

export const fetchShortUrl = async (url,segmentId) => {
  const { data } = await axiosInstance.post('/api/v1/share', 
    { 
      segment_id: segmentId,
      language: "bo",
      url,
    });
  return data;
}
const getURLwithUpdatedSegmentId = (segmentId) => {
  const urlObj = new URL(window.location.href);
  urlObj.searchParams.set("segment_id", segmentId);
  return urlObj.toString();
}
const ShareView = ({ setIsShareView, segmentId, handleNavigate }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslate();
  const url= getURLwithUpdatedSegmentId(segmentId)

  const { data: shorturldata, isLoading} = useQuery(
    ["toc", url, segmentId],
    () => fetchShortUrl(url, segmentId),
    { 
      refetchOnWindowFocus: false,
    }
  );
  return (
    <div>
      <div className="headerthing">
        <IoChevronBackSharp size={24} onClick={() => handleNavigate()} className="back-icon" />
        <p className='mt-4 px-4 listtitle'>{t('panel.resources')}</p>
        <IoMdClose
          size={24}
          onClick={() => setIsShareView("main")}
          className="close-icon"
        />
      </div>
      <div className="share-content p-3">
        <p className="mb-3 text-great ">{t('text.share_link')}</p>
        <div className="share-url-container p-3 mb-3">
          <p className="share-url text-truncate en-text">{isLoading ? t("common.loading") : shorturldata?.shortUrl}</p>
          <button
            className="copy-button"
            onClick={() => {
              navigator.clipboard.writeText(shorturldata?.shortUrl);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 3000);
            }}
          >
            {copied ? <IoMdCheckmark size={16}/> : <IoCopy size={16}/>}
          </button>
        </div>
        <p className="text-great">{t('text.more_options')}</p>
        <div className="social-share-buttons">
          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shorturldata?.shortUrl ||  url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="social-button"
          >
            <BsFacebook className="social-icon"/>{t('common.share_on_fb')}
          </a>
          <a 
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shorturldata?.shortUrl || url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="social-button"
          >
            <BsTwitter className="social-icon"/>{t('common.share_on_x')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShareView;
ShareView.propTypes = {
  setIsShareView: PropTypes.func.isRequired,
  segmentId: PropTypes.string.isRequired,
  handleNavigate: PropTypes.func.isRequired,
}