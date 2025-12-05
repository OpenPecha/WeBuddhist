import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const Seo = ({
  title,
  description,
  canonical,
}) => {
  const location = useLocation();
  const siteBaseUrl = window.location.origin;
  const computedCanonical = canonical || `${siteBaseUrl}${location.pathname}`;

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <link rel="canonical" href={computedCanonical} />
      <meta name="description" content={description} />
    </Helmet>
  );
};

export default Seo;

Seo.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  canonical: PropTypes.string,
};



