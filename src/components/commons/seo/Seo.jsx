import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const Seo = ({
  title,
  description = "",
  type = "website",
  image,
  canonical,
  siteName = "Webuddhist",
}) => {
  const location = useLocation();
  const siteBaseUrl = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;
  const computedCanonical = canonical || `${siteBaseUrl}${location.pathname}`;
  const defaultImage = `${siteBaseUrl}/img/pecha-logo.svg`;
  const imageUrl = image || defaultImage;

  return (
    <Helmet prioritizeSeoTags>
      {title && <title>{title}</title>}
      <link rel="canonical" href={computedCanonical} />
      {description && <meta name="description" content={description} />}

      <meta property="og:site_name" content={siteName} />
      <meta property="og:url" content={computedCanonical} />
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default Seo;

Seo.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  type: PropTypes.string,
  image: PropTypes.string,
  canonical: PropTypes.string,
  siteName: PropTypes.string,
};



