import React, { useState } from 'react';
import { useParams,useNavigate, useSearchParams } from 'react-router-dom';
import pechaIcon from '../../../assets/icons/pecha_icon.png';
import './SheetDetailPage.scss';
import YouTube from 'react-youtube';
import { FiEdit, FiTrash, FiEye, FiPrinter } from "react-icons/fi";
import { usePanelContext, PanelProvider } from '../../../context/PanelContext';
import { extractSpotifyInfo } from '../sheet-utils/Constant';
import axiosInstance from '../../../config/axios-config';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslate } from '@tolgee/react';
import {getLanguageClass} from "../../../utils/helperFunctions.jsx";
import Resources from "../../chapterV2/utils/resources/Resources.jsx";
import { SheetDeleteModal } from '../local-components/modals/sheet-delete-modal/SheetDeleteModal';
import SheetShare from '../local-components/sheet-share/sheetShare';

export const getUserInfo=async()=>{
  const {data}=await axiosInstance.get(`/api/v1/users/info`,{
    headers:{
      Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`
    }
  })
  return data
}
export const fetchSheetData=async(id)=>{
const {data}=await axiosInstance.get(`/api/v1/sheets/${id}`,{
  params:{
    skip:0,
    limit:10,
  }
})
return data
}

export const deleteSheet = async (id) => {
  await axiosInstance.delete(`/api/v1/sheets/${id}`);
  return true;
}

export const updateSheetVisibility = async (sheetId, isPublished, sheetData) => {
  const source = sheetData.content.segments.map((segment, index) => {
    if (["image", "audio", "video"].includes(segment.type)) {
      return {
        position: index,
        type: segment.type,
        content: segment.content,
      };
    }
    if (segment.type === "source") {
      return {
        position: index,
        type: "source",
        content: segment.segment_id,
      };
    }
    return {
      position: index,
      type: "content", 
      content: segment.content,
    };
  });
  
  await axiosInstance.put(`/api/v1/sheets/${sheetId}`, {
    title: sheetData.sheet_title,
    source: source,
    is_published: isPublished
  });
  return true;
};

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
  let i=0;
  const { sheetSlugAndId } = useParams();
  const sheetId = sheetSlugAndId.split('_').pop();
  const {t}=useTranslate();
  const navigate=useNavigate();
  const queryClient=useQueryClient();
  const {data:userInfo}=useQuery({
    queryKey:['userInfo'],
    queryFn:getUserInfo,
    enabled:!!sessionStorage.getItem('accessToken')
  })
  const {data:sheetData, isLoading} = useQuery({
    queryKey:['sheetData',sheetId],
    queryFn:()=>fetchSheetData(sheetId)
  })
  const [segmentId, setSegmentId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { isResourcesPanelOpen, openResourcesPanel, closeResourcesPanel } = usePanelContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: deleteSheetMutation } = useMutation({
    mutationFn: () => deleteSheet(sheetId),
    onSuccess: () => {
      setIsModalOpen(false);
      navigate('/community');
    },
    onError: (error) => {
      console.error("Error deleting sheet:", error);
    }
  });

  const { mutate: updateVisibilityMutation } = useMutation({
    mutationFn: (isPublished) => updateSheetVisibility(sheetId, isPublished, sheetData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheetData', sheetId] });
    },
    onError: (error) => {
      console.error("Error updating visibility:", error);
    }
  });

  const handleSidePanelToggle = (segmentId) => {
    setSegmentId(segmentId);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('segment_id', segmentId);
    setSearchParams(newParams);
    openResourcesPanel();
  };

  const handleVisibilityToggle = () => {
    const newVisibility = !sheetData.is_published;
    updateVisibilityMutation(newVisibility);
  };

  const renderSegment = (segment) => {
    switch (segment.type) {
      case 'source':
        return (
          <button
            key={segment.segment_id}
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
          <div className="segment segment-text" key={`${segment.segment_id}-${i++}`}>
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
          <FiPrinter onClick={() => window.print()}/>
          <SheetShare />         
          {sheetData.publisher.email === userInfo?.email && (
            <>
          <FiEdit onClick={()=>{
            navigate(`/sheets/${sheetId}`)
          }}/>
         
          <FiTrash onClick={() => setIsModalOpen(true)} />
          <button className={`visibility-button ${sheetData.is_published ? 'public' : 'private'}`} onClick={handleVisibilityToggle}>
          {sheetData.is_published ? 'Public' : 'Private'}
        </button>
          </>
        )}
        </div>
      </div>
    )
  }
  const renderUserInfo=()=>{
    const { name, username, avatar_url } = sheetData.publisher;
    return(
      <div className="user-info">
        {avatar_url ? (
        <img src={avatar_url}
         alt="user" className='user-info-avatar' />
        ) : (
          <div className="avatar-initials">
            {sheetData.publisher.name.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
          </div>
        )}
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
      <SheetDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={deleteSheetMutation}
      />
    </div>
  );
};

const SheetDetailPageWithPanelContext = () => (
  <PanelProvider>
    <SheetDetailPage />
  </PanelProvider>
);

export default SheetDetailPageWithPanelContext; 