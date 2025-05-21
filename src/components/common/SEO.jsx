import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title, 
  description, 
  image, 
  type = 'website', 
  language = 'bo', 
  segmentId = ''
}) {
  // Default values
  const defaultTitle = "Pecha - Learn, live, and share Buddhist wisdom everyday";
  const defaultDescription = "The largest free library of Buddhist texts available to read online in Tibetan, English and Chinese including Sutras, Tantras, Abhidharma, Vinaya, commentaries and more.";
  const defaultImage = `https://pecha-backend-12341825340-1fb0112.onrender.com/api/v1/share/image/?segment_id=${segmentId}&language=${language}`;
  
  // Use provided values or defaults
  const metaTitle = title || defaultTitle;
  const metaDescription = description || defaultDescription;
  const metaImage = image || defaultImage;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{metaTitle}</title>
      <meta name='description' content={metaDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
}
