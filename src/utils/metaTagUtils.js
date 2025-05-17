/**
 * Utility functions for managing meta tags
 */

export const updateOgMetaTags = (segmentId, language = "bo") => {
  if (!segmentId) return;

  const ogImageUrl = `https://pecha-backend-12341825340-1fb0112.onrender.com/api/v1/share/image/?segment_id=${segmentId}&language=${language}`;

  // Find existing og:image tag
  let ogImageTag = document.querySelector('meta[property="og:image"]');

  if (!ogImageTag) {
    ogImageTag = document.createElement("meta");
    ogImageTag.setAttribute("property", "og:image");
    document.head.appendChild(ogImageTag);
  }

  // Update the content attribute
  ogImageTag.setAttribute("content", ogImageUrl);

  const currentUrl = window.location.href;
  const url = new URL(currentUrl);

  if (!url.searchParams.has("segment_id")) {
    url.searchParams.set("segment_id", segmentId);
  }

  let ogUrlTag = document.querySelector('meta[property="og:url"]');

  if (!ogUrlTag) {
    ogUrlTag = document.createElement("meta");
    ogUrlTag.setAttribute("property", "og:url");
    document.head.appendChild(ogUrlTag);
  }

  ogUrlTag.setAttribute("content", url.toString());

  return {
    ogImageUrl,
    ogUrl: url.toString(),
  };
};

export const resetOgMetaTags = () => {
  const defaultOgImage =
    "https://pecha-backend-12341825340-1fb0112.onrender.com/api/v1/share/image/?segment_id=&language=bo";

  const ogImageTag = document.querySelector('meta[property="og:image"]');
  if (ogImageTag) {
    ogImageTag.setAttribute("content", defaultOgImage);
  }

  const ogUrlTag = document.querySelector('meta[property="og:url"]');
  if (ogUrlTag) {
    ogUrlTag.setAttribute(
      "content",
      window.location.origin + window.location.pathname
    );
  }
};
