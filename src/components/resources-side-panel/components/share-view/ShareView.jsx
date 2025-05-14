import { useState } from "react";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { IoCopy } from "react-icons/io5";
import { BsFacebook, BsTwitter } from "react-icons/bs";
import { useTranslate } from "@tolgee/react";
import "./ShareView.scss";

const ShareView = ({ sidePanelData, setIsShareView, shortUrl }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslate();

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
          <p className="share-url text-truncate">{shortUrl || sidePanelData?.text_infos?.short_url || window.location.href}</p>
          <button
            className="copy-button"
            onClick={() => {
              navigator.clipboard.writeText(shortUrl || sidePanelData?.text_infos?.short_url || window.location.href);
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
