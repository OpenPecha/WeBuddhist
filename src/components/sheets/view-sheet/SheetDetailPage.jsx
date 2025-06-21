import React from 'react';
import { useParams } from 'react-router-dom';
import { getLanguageClass } from '../../../utils/Constants';
import pechaIcon from '../../../assets/icons/pecha_icon.png';
import './SheetDetailPage.scss';

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
            media_url: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
          }
        ],
        created: "2024-03-20",
        updated: "2024-03-21",
        published: "2024-03-12"
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
            <div className="segment-number">{segment.segment_number}</div>
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
            <div className="segment-number">{segment.segment_number}</div>
            <p className="text-content">{segment.content}</p>  {/* TODO: just create it as dangerous inner html  */}
          </div>
        );
      case 'image': //TODO : case for audio and video
        return (
          <div className="segment segment-image" key={segment.segment_id}>
            <div className="segment-number">{segment.segment_number}</div>
            <figure>
              <img src={segment.media_url} alt="Sheet content" />
            </figure>
          </div>
        );
      default:
        return null;
    }
  };

  const renderHeader = () => {
    return (
      <header className="sheet-detail-page-header">
         <header className="sheet-detail-page-header">
          <h1>{sheetData.sheet_title}</h1>
          <div className="metadata">
            <time>Published: {sheetData.content.sections[0].published}</time>
            <time>Last updated: {sheetData.content.sections[0].updated}</time>
          </div>
        </header>
      </header>
    );
  };

  return (
    <main className="sheet-detail-container">
      <article className="sheet-detail-page">
        {renderHeader()}
        <div>
          {/* use format as as how i did for renderheader */}
          {/* TODO: here create the ui same as the medium (the view,like,edit,delete) import icon from react-icons */}
        </div>
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