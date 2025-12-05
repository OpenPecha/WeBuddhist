import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const Seo = ({
  title,
  description,
  canonical,
}: { title: string, description: string, canonical: string }) => {
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
