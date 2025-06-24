import React from 'react';
import { useParams } from 'react-router-dom';
import { getLanguageClass } from '../../../utils/Constants';
import pechaIcon from '../../../assets/icons/pecha_icon.png';
import './SheetDetailPage.scss';
import YouTube from 'react-youtube';
import { FiEdit ,FiTrash,FiHeart,FiEye} from "react-icons/fi";
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
            segment_id: "123",
            segment_number: "1.1",
            content: "the great lama and his teachings",
            text_title: "Fundamentals of Buddhism",
            type: "source"
          },
          {
            segment_id: "124",
            segment_number: "1.2",
            content: "hello hello",
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
            content: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" //TODO: do changes such that spotify and soundcloud ui can be used
          },
          {
            segment_id: "127",
            segment_number: "1.5",
            type: "video",
            content: "5noIKN8t69U"
          }
        ],
      },
    ]
  },
  skip: 0,
  limit: 10,
  total: 1
};

const SheetDetailPage = () => {
  const { publisherName, sheetSlugAndId } = useParams();
  const sheetId = sheetSlugAndId.split('-').pop(); //TODO : need later when we call the get api

  const renderSegment = (segment) => {
    switch (segment.type) {
      case 'source':
        return (
          <div className="segment segment-source" key={segment.segment_id}>
            <div className="source-content">
              <img src={pechaIcon} className='pecha-icon' alt="source icon" />
              <div className={getLanguageClass(segment.language || 'en')}>
                <p>{segment.content}</p>
              </div>
              <p className="pecha-title">{segment.text_title}</p>
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="segment segment-text" key={segment.segment_id}>
            <p className="text-content">{segment.content}</p>  {/* TODO: just create it as dangerous inner html  */}
          </div>
        );
      case 'image': //TODO : case for audio
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
          <div className="view-toolbar-item-like">
          <FiHeart />
          <p>120</p>
          </div>
          <div className="view-toolbar-item-eye">
          <FiEye />
          <p>20</p>
          </div>
        </div>
        <div className="view-toolbar-item">
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
  return (
    <main className="sheet-detail-container">
      <article className="sheet-detail-page">
        {renderHeader()}
        {renderUserInfo()}
        {renderViewToolbar()}
        <div className="sheet-content">
          {sheetData.content.sections.map((section) => (
            <section key={section.id} className="sheet-section">
              <div className="segments">
                {section.segments.map((segment) => renderSegment(segment))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
};

export default SheetDetailPage; 