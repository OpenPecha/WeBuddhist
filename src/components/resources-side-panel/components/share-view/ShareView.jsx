import { useState } from "react";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { IoCopy } from "react-icons/io5";
import { BsFacebook, BsTwitter } from "react-icons/bs";
import { useTranslate } from "@tolgee/react";
import "./ShareView.scss";
import { useQuery } from "react-query";
import axios from "axios";

export const fetchShortUrl = async (url) => {
    const { data } = await axios.post('https://url-shortening-14682653622-b69c6fd.onrender.com/api/v1/shorten', 
      { 
        url,
        tags: ""
      });
    return data;
}
const ShareView = ({ sidePanelData, setIsShareView, shortUrl }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslate();
  //TODO: remove this
  const shorturl="http://localhost:5173/texts/text-details?text_id=032b9a5f-0712-40d8-b7ec-73c8c94f1c15&contentId=78c33db2-e0bf-48b3-9d2e-82e9c84301da&versionId=&contentIndex=1"
  const { data: shorturldata, isLoading} = useQuery(
    ["toc", shorturl],
    () => fetchShortUrl(shorturl),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20,
    }
  );
  console.log(shorturldata)
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
          <p className="share-url text-truncate">{ window.location.href || shorturldata?.short_url}</p>
          <button
            className="copy-button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href || shorturldata?.short_url);
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
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl || sidePanelData?.text_infos?.short_url || window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="social-button"
          >
            <BsFacebook className="social-icon"/>{t('common.share_on_fb')}
          </a>
          <a 
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl || sidePanelData?.text_infos?.short_url || window.location.href)}`}
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
