import { useState } from "react";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { IoCopy } from "react-icons/io5";
import { BsFacebook, BsTwitter } from "react-icons/bs";
import { useTranslate } from "@tolgee/react";
import "./ShareView.scss";
import { useQuery } from "react-query";
import axiosInstance from "../../../../config/axios-config";
import { useSearchParams } from "react-router-dom";

export const fetchShortUrl = async (url,segmentId) => {
  const { data } = await axiosInstance.post('/api/v1/share', 
    { 
      segment_id: segmentId,
      language: "bo",
      url,
    });
  return data;
}

const ShareView = ({ setIsShareView }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslate();
  const pageUrl = window.location.href;
  const [searchParams] = useSearchParams();
  const segmentId = searchParams.get('segment_id') || "";
  const { data: shorturldata, isLoading} = useQuery(
    ["toc", pageUrl, segmentId],
    () => fetchShortUrl(pageUrl, segmentId),
    { 
      refetchOnWindowFocus: false,
    }
  );
  return (
    <div>
      <div className="headerthing">
        <p className='mt-4 px-4 listtitle'>{t('panel.resources')}</p>
        <IoMdClose
          size={24}
          onClick={() => setIsShareView("main")}
          className="close-icon"
        />
      </div>
      <div className="share-content p-3">
        <p className="mb-3 textgreat ">{t('text.share_link')}</p>
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
        <p className="textgreat">{t('text.more_options')}</p>
        <div className="social-share-buttons">
          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shorturldata?.shortUrl || window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="social-button"
          >
            <BsFacebook className="social-icon"/>{t('common.share_on_fb')}
          </a>
          <a 
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shorturldata?.shortUrl || window.location.href)}`}
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
