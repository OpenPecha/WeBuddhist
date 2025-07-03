import React, { useState } from 'react';
import { useParams,useNavigate, useSearchParams } from 'react-router-dom';
import { getLanguageClass, USER_NOT_FOUND } from '../../../utils/Constants';
import pechaIcon from '../../../assets/icons/pecha_icon.png';
import './SheetDetailPage.scss';
import YouTube from 'react-youtube';
import { FiEdit, FiTrash, FiEye, FiShare, FiPrinter } from "react-icons/fi";
import { usePanelContext, PanelProvider } from '../../../context/PanelContext';
import { extractSpotifyInfo } from '../sheet-utils/Constant';
import axiosInstance from '../../../config/axios-config';
import { useQuery } from 'react-query';
import { useTranslate } from '@tolgee/react';
import {getLanguageClass} from "../../../utils/helperFunctions.jsx";
import Resources from "../../chapterV2/utils/resources/Resources.jsx";

export const fetchSheetData=async(id)=>{
const {data}=await axiosInstance.get(`/api/v1/sheets/${id}`,{
  params:{
    skip:0,
    limit:10,
  }
})
return data
}

const getAudioSrc = (url) => {
  const spotify = extractSpotifyInfo(url);
  if (spotify) {
    return `https://open.spotify.com/embed/${spotify.type}/${spotify.id}?utm_source=generator`;
  }
  if (url.includes('soundcloud.com')) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500`;
  }
  return null;
}
  

const SheetDetailPage = () => {
  // const { sheetSlugAndId } = useParams();
  // const sheetId = sheetSlugAndId.split('-').pop();
  const {t}=useTranslate();
  const navigate=useNavigate();
  const sheetId= "455f346e-a73f-4d86-9e05-19b24bce2984"//remove this once samdup work is done
  const {data:sheetData, isLoading} = useQuery({
    queryKey:['sheetData',sheetId],
    queryFn:()=>fetchSheetData(sheetId)
  })
  const [segmentId, setSegmentId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { isResourcesPanelOpen, openResourcesPanel, closeResourcesPanel } = usePanelContext();

  const handleSidePanelToggle = (segmentId) => {
    setSegmentId(segmentId);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('segment_id', segmentId);
    setSearchParams(newParams);
    openResourcesPanel();
  };
  const renderSegment = (segment) => {
    switch (segment.type) {
      case 'source':
        return (
          <button
            className={`segment segment-source ${isResourcesPanelOpen && segmentId === segment.segment_id ? 'selected' : ''}`}
            onClick={() => handleSidePanelToggle(segment.segment_id)}
          >
            <div className="source-content">
              <img src={pechaIcon} className='pecha-icon' alt="source icon" />
              <div className={getLanguageClass(segment.language || 'en')}>
                <p className={`${getLanguageClass(segment.language || 'bo')}`} dangerouslySetInnerHTML={{__html:segment.content}}/>
              </div>
              <p className="pecha-title">{segment.text_title}</p>
            </div>
          </button>
        );
      case 'content':
        return (
          <div className="segment segment-text" key={segment.segment_id}>
            <p className="text-content" dangerouslySetInnerHTML={{ __html: segment.content }}/>
          </div>
        );
      case 'image':
        return (
          <div className="segment segment-image" key={segment.segment_id}>
            <figure>
              <img src={segment.content} alt="Sheet content" />
            </figure>
          </div>
        );
      case 'video':
        return (
          <div className="segment segment-video" key={segment.segment_id}>
            <YouTube videoId={segment.content} />
          </div>
        ); 
      case 'audio': {
          const audioSrc = getAudioSrc(segment.content);
          return (
            <div className="segment segment-audio" key={segment.segment_id}>
              <iframe
                src={audioSrc}
                width="100%"
                height="166"
                title={`audio-${segment.segment_id}`}
              />
            </div>
          );
        }
      default:
        return null;
    }
  };

  if (isLoading) {
      return <p>{t("common.loading")}</p>;
  }

  if (!sheetData || sheetData.content.segments.length === 0) {
    return <p>{t("text_category.message.notfound")}</p>;
  }

  const renderHeader = () => {
    return (
         <header className="sheet-detail-page-header">
          <h1>{sheetData.sheet_title}</h1>
        </header>
    );
  };
  const renderViewToolbar=()=>{
    return(
      <div className="view-toolbar">
        <div className="view-toolbar-item">
          <div className="view-toolbar-item-eye">
          <FiEye />
          <p>{sheetData.views || 0}</p>
          </div>
        </div>
        <div className="view-toolbar-item">
          <FiPrinter/>
          <FiShare/>
          <FiEdit onClick={()=>{
            navigate(`/sheets/${sheetId}`)
          }}/>
          <FiTrash />
        </div>
      </div>
    )
  }
  const renderUserInfo=()=>{
    const { name, username, avatar_url } = sheetData.publisher;
    return(
      <div className="user-info">
        <img src={avatar_url}
        onError={(e)=>{
          e.target.src=USER_NOT_FOUND
        }}
         alt="user" className='user-info-avatar' />
        <div className="user-info-text">
          <p>{name}</p>
          <p>@{username}</p>
        </div>
      </div>
    )
  }
  const renderSheetContent=()=>{
    return(
      <div className="sheet-content">
        <section className="sheet-section">
          <div className="segments ">
            {sheetData.content.segments.map((segment) => renderSegment(segment))}
          </div>
        </section>
      </div>
    )
  }
  return (
    <div className="sheet-detail-wrapper">
      <main className={`sheet-detail-container ${isResourcesPanelOpen ? 'with-side-panel' : ''}`}>
        <article className="sheet-detail-page">
          {renderHeader()}
          {renderUserInfo()}
          {renderViewToolbar()}
          {renderSheetContent()}
        </article>
      </main>
      {isResourcesPanelOpen && segmentId && (
        <Resources
          segmentId={segmentId}
          handleClose={closeResourcesPanel}
        />
      )}
    </div>
  );
};

const SheetDetailPageWithPanelContext = () => (
  <PanelProvider>
    <SheetDetailPage />
  </PanelProvider>
);

export default SheetDetailPageWithPanelContext; 