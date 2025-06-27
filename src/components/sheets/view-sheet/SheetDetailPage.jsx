import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getLanguageClass } from '../../../utils/Constants';
import pechaIcon from '../../../assets/icons/pecha_icon.png';
import './SheetDetailPage.scss';
import YouTube from 'react-youtube';
import { FiEdit, FiTrash, FiEye, FiShare, FiPrinter } from "react-icons/fi";
import Resources from '../../resources-side-panel/Resources';
import { usePanelContext, PanelProvider } from '../../../context/PanelContext';
import { extractSpotifyInfo } from '../sheet-utils/Constant';

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
  

//TODO: to be remove when api is ready
const sheetData = {
  sheet_title: "The great Dhrama of Tibet ",
  content: {
    id: "123455",
    text_id: "123456",
    sections: [
      {
        id: "12345",
        title: null,
        section_number: "1",
        parent_id: "1212",
        segments: [
          { 
            segment_id: "d0a5b00b-0989-4e9e-87d8-db4f72e6ceca",
            segment_number: "1.1",
            content: "རིན་ཆེན་སེམས་དེ་གཟུང་བར་བྱ་བའི་ཕྱིར།།<br>དེ་བཞིན་གཤེགས་པ་རྣམས་དང་དམ་པའི་ཆོས།།<br>དཀོན་མཆོག་དྲི་མ་མེད་དང་སངས་རྒྱས་སྲས།།<br>ཡོན་ཏན་རྒྱ་མཚོ་རྣམས་ལ་ལེགས་པར་མཆོད།།",
            text_title: "Fundamentals of Buddhism",
            type: "source"
          },
          {
            segment_id: "124",
            segment_number: "1.2",
            content: "Whatever flowers and fruits there may be,<strong>And whatever varieties</strong> of medicines exist,Whatever precious <strong>substances</strong> there are in the world,And whatever pure and delightful waters there are.",
            type: "text"
          },
          {
            segment_id: "125",
            segment_number: "1.3",
            type: "image",
            content: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
          },
          {
            segment_id: "126",
            segment_number: "1.4",
            type: "audio",
            content: "https://soundcloud.com/planetfitnessmotivation/hip-hop-workout-music-mix-2018-gym-training-motivation?in_system_playlist=personalized-tracks%3A%3Atenzin-lungsang%3A280487518" //TODO: do changes such that spotify and soundcloud ui can be used
          },
          {
            segment_id: "127",
            segment_number: "1.5",
            type: "video",
            content: "oOylEw3tPQ8"
          },
          {
            segment_id: "128",
            segment_number: "1.6",
            type: "audio",
            content: "https://open.spotify.com/album/40d8W7uNHGeih483QVvLu4" //TODO: do changes such that spotify and soundcloud ui can be used
          },
        ],
      },
    ]
  },
  skip: 0,
  limit: 10,
  total: 1
};

const SheetDetailPage = () => {
  // const { publisherName, sheetSlugAndId } = useParams();
  // const sheetId = sheetSlugAndId.split('-').pop(); //TODO : need later when we call the get api
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
          <div 
            className={`segment segment-source ${isResourcesPanelOpen && segmentId === segment.segment_id ? 'selected' : ''}`} 
            key={segment.segment_id} 
            onClick={() => handleSidePanelToggle(segment.segment_id)}
          >
            <div className="source-content">
              <img src={pechaIcon} className='pecha-icon' alt="source icon" />
              <div className={getLanguageClass(segment.language || 'en')}>
                <p className={`${getLanguageClass(segment.language || 'bo')}`} dangerouslySetInnerHTML={{__html:segment.content}}/>
              </div>
              <p className="pecha-title">{segment.text_title}</p>
            </div>
          </div>
        );
      case 'text':
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
      case 'audio':
          const audioSrc = getAudioSrc(segment.content);
          return (
            <div className="segment segment-audio" key={segment.segment_id}>
              <iframe
                src={audioSrc}
                width="100%"
                height="166"
              />
            </div>
          );
      default:
        return null;
    }
  };

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
          <p>20</p>
          </div>
        </div>
        <div className="view-toolbar-item">
          <FiPrinter/>
          <FiShare/>
          <FiEdit />
          <FiTrash />
        </div>
      </div>
    )
  }
  const renderUserInfo=()=>{
    return(
      <div className="user-info">
        <img src="https://avatars.githubusercontent.com/u/122612557?v=4" alt="user" className='user-info-avatar' />
        <div className="user-info-text">
          <p>Tenzin Delek</p>
          <p>@tenzin_delek.3248</p>
        </div>
      </div>
    )
  }
  const renderSheetContent=()=>{
    return(
      <div className="sheet-content">
      {sheetData.content.sections.map((section) => (
        <section key={section.id} className="sheet-section">
          <div className="segments ">
            {section.segments.map((segment) => renderSegment(segment))}
          </div>
        </section>
      ))}
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