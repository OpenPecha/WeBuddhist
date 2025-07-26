import React, { useState, useRef, useEffect } from 'react';
import { FiShare2, FiCopy } from 'react-icons/fi';
import { FaFacebook, FaTwitter } from 'react-icons/fa';
import './SheetShare.css';

const SheetShare = ({ url = window.location.href }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);

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

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url)
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
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

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
          >
            <FiCopy className="share-icon" />
            <span>Copy link</span>
          </button>
          
          <button 
            className="share-option" 
            onClick={() => shareOnPlatform('twitter')}
          >
            <FaTwitter className="share-icon" />
            <span>Share on X</span>
          </button>
          
          <button 
            className="share-option" 
            onClick={() => shareOnPlatform('facebook')}
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