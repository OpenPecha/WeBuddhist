import { useEffect, useRef, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Chapter.scss';
import axiosInstance from "../../config/axios-config.js";
import { IoMdCheckmark, IoMdClose } from 'react-icons/io';
import { useTranslate } from '@tolgee/react';
import { LANGUAGE, mapLanguageCode, menuItems } from '../../utils/Constants.js';
import { IoCopy, IoLanguage, IoNewspaperOutline } from "react-icons/io5";
import { BsFacebook, BsTwitter, BsWindowFullscreen, BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { FiInfo, FiList } from "react-icons/fi";
import { BiBook, BiSearch } from 'react-icons/bi';
import { useQuery } from 'react-query';
import {useLocation, useSearchParams} from "react-router-dom";

//this is for the side panel
export const fetchTextsInfo = async (text_id) => {
    const storedLanguage = localStorage.getItem(LANGUAGE);
    const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
    const { data } = await axiosInstance.get(`/api/v1/texts/${ text_id }/infos`, {
        params: {
            language,
            text_id
        }
    });
    return data;
};

//this is for the main content
export const fetchTextDetails = async (text_id, content_id, versionId,skip, limit) => {
    const { data } = await axiosInstance.post(`/api/v1/texts/${ text_id }/detals`, {
      content_id:content_id ?? "",
      version_id: versionId ?? ""
    },{
      params: {
        limit,
        skip
      }
    });
    return data;
}
const Chapter = () => {
  const [segments, setSegments] = useState([]);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [isShareView, setIsShareView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const containerRef = useRef(null);
  const location = useLocation(); // Get the state
  const title = location.state?.titleInformation || "";
  const id = "12" //will be coming as a param
  const [searchParams] = useSearchParams();
  const {t} = useTranslate();

  const textId = searchParams.get("text_id");
  const contentId = searchParams.get("content_id");
  const versionId = searchParams.get("version_id");
  const {data: sidetextData} = useQuery(
    ["texts", id],
    () => fetchTextsInfo(id),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20
    }
  );

  const {data: textDetails} = useQuery(
    ["textsDetails", textId, page],
    () => fetchTextDetails(textId, contentId,versionId, page, 40),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 1000 * 60 * 20
    }
  );

  useEffect(() => {
    if (contents.length) {
      setContents(prevState => {
        return [
          ...prevState,
          ...textDetails.contents
        ]
      })
    } else if (textDetails) {
      setContents(prevState => {
        return [...prevState, ...textDetails.contents]
      })
    }
    setLoading(false);
  }, [textDetails]);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [page, loading]);


  // helper function
  const handleScroll = () => {
    if (!containerRef.current) return;
    const {scrollTop, scrollHeight, clientHeight} = containerRef.current;
    const scrollPosition = (scrollTop + clientHeight) / scrollHeight;
    if (scrollPosition >= 0.75 && !loading && hasMore) {
      setLoading(true);
      setPage(prevState => prevState + 1);
    }
  };

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
            <p className="share-url text-truncate">{sidetextData?.text_infos?.short_url}</p>
            <button
              className="copy-button"
              onClick={() => {
                navigator.clipboard.writeText(sidetextData?.text_infos?.short_url);
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

                {sidetextData?.text_infos?.translations > 0 && (
                  <p>
                    <IoLanguage className="m-2"/>
                    {`${t("connection_pannel.translations")} (${sidetextData.text_infos.translations})`}
                  </p>
                )}

                {sidetextData?.text_infos?.related_texts?.length > 0 && (
                  <>
                    <p className='textgreat'>{t("text.related_texts")}</p>
                    <div className='related-texts-container'>
                      {sidetextData.text_infos.related_texts.map((data, index) => (
                        <p key={index} className='related-text-item'>
                          <BiBook className="m-2"/>
                          {`${data.title} (${data.count})`}
                        </p>
                      ))}
                    </div>
                  </>
                )}

                {sidetextData?.text_infos?.sheets > 0 && (
                  <>
                    <p className='textgreat'>{t("panel.resources")}</p>
                    <p>
                      <IoNewspaperOutline className="m-2"/>
                      {` ${t("common.sheets")} (${sidetextData.text_infos.sheets})`}
                    </p>
                  </>
                )}

                {sidetextData?.text_infos?.web_pages > 0 && (
                  <p>
                    <BsWindowFullscreen className="m-2"/>
                    {` ${t("text.web_pages")} (${sidetextData.text_infos.web_pages})`}
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

  const HeaderOverlay = () => {
    return (
      <div className="header-overlay">
        <div/>

        <div className="text-container listtitle">
          {title?.text}
        </div>

        <button
          className="bookmark-button"
          onClick={() => setIsBookmarked(!isBookmarked)}
        >
          {isBookmarked ? <BsBookmarkFill size={20}/> : <BsBookmark size={20}/>}
        </button>
      </div>
    );
  };

  const renderContent = (item) => {
    return (
      <div key={item.id} className="section navbaritems ">
        <h2>{item.title}</h2>

        {item?.segments?.map(segment => (
          <div
            key={segment.id}
            className="text-segment listtitle mb-4"
            onClick={() => setShowPanel(true)}
          >
            <div key={segment.segment_id} className="segment">
              <span className="segment-number">{segment.segment_number}</span>
              <div dangerouslySetInnerHTML={{__html: segment.content}}/>
            </div>
          </div>
        ))}

        {item?.sections?.map(section => (
          <div key={section.id} className="nested-section">
            <h3>{section.title}</h3>

            {section?.segments?.map(segment => (
              <div
                key={segment.id}
                className="text-segment listtitle mb-4"
                onClick={() => setShowPanel(true)}
              >
                <div key={segment.segment_id} className="segment">
                  <span className="segment-number">{segment.segment_number}</span>
                  <div dangerouslySetInnerHTML={{__html: segment.content}}/>
                </div>
              </div>
            ))}

            {section?.sections?.map(nestedSection =>
              renderContent(nestedSection)
            )}
          </div>
        ))}
      </div>
    );
  };

  // main rendere
  return (
    <>
      <HeaderOverlay/>

      <Container fluid className="p-0">

        <div
          ref={containerRef}
          className="tibetan-text-container"
        >
          {contents?.map((item) => {
            return (<div key={item.id}>
              {item.segments.map(segment => renderContent(segment))}
            </div>)
          })}
          {loading && (
            <div className="text-center my-4">
              <Spinner animation="border" role="output">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}

          {!hasMore && segments.length > 0 && (
            <div className="text-center text-muted my-4">
              End of content
            </div>
          )}
        </div>
        {renderSidePanel()}
      </Container>
    </>
  );
};

export default Chapter;
