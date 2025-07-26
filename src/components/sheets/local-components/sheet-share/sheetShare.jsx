import React, { useState, useRef, useEffect } from 'react';
import { FiShare2, FiCopy } from 'react-icons/fi';
import { FaFacebook, FaTwitter } from 'react-icons/fa';
import { useQuery } from 'react-query';
import axiosInstance from '../../../../config/axios-config.js';
import './SheetShare.scss';

// ----------------------------- helpers ---------------------------------------

const extractTextIdFromUrl = (url) => {
  try {
    const urlPath = new URL(url).pathname;
    const lastPathPart = urlPath.split('/').pop();
    const textId = lastPathPart.split('_').pop();
    return textId;
  } catch (error) {
    console.error('Error extracting text_id from URL:', error);
    return null;
  }
};

// ----------------------------- api calls ------------------------------------

export const fetchShortUrl = async (url, textId, language = 'bo') => {
  const { data } = await axiosInstance.post('/api/v1/share', { 
    text_id: textId,
    language: language,
    url,
  });
  return data;
};

const SheetShare = ({ url = window.location.href, language = 'bo' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const textId = extractTextIdFromUrl(url);

  const { data: shorturlData, isLoading } = useQuery(
    ["shortUrl", url, textId, isOpen],
    () => fetchShortUrl(url, textId, language),
    {
      refetchOnWindowFocus: false,
      enabled: isOpen && Boolean(textId),
    }
  );

  const getShareableUrl = () => {
    return shorturlData?.shortUrl || url;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  // ----------------------------- event handlers -------------------------------

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareableUrl())
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setIsOpen(false), 1000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const shareOnPlatform = (platform) => {
    let shareUrl;
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareableUrl())}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareableUrl())}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  // ----------------------------- renderers -------------------------------------

  return (
    <div className="sheet-share-container" ref={dropdownRef}>
      <button 
        className="share-button" 
        onClick={toggleDropdown}
        aria-label="Share"
      >
        <FiShare2 />
      </button>
      
      {isOpen && (
        <div className="share-dropdown">
          <button 
            className="share-option" 
            onClick={handleCopyLink}
            disabled={isLoading && !textId}
          >
            <FiCopy className="share-icon" />
            <span>{isLoading ? "Loading..." : textId ? "Copy link" : "Invalid URL"}</span>
          </button>
          
          <button 
            className="share-option" 
            onClick={() => shareOnPlatform('twitter')}
            disabled={isLoading || !textId}
          >
            <FaTwitter className="share-icon" />
            <span>Share on X</span>
          </button>
          
          <button 
            className="share-option" 
            onClick={() => shareOnPlatform('facebook')}
            disabled={isLoading || !textId}
          >
            <FaFacebook className="share-icon" />
            <span>Share on Facebook</span>
          </button>
          
        </div>
      )}
      
      {copySuccess && (
        <div className="copy-success-tooltip">
          Link copied!
        </div>
      )}
    </div>
  );
};

export default SheetShare;