import React, { useState, useRef, useEffect } from 'react';
import { FiShare2 } from 'react-icons/fi';
import { FaFacebook, FaTwitter } from 'react-icons/fa';
import { useQuery } from 'react-query';
import axiosInstance from '../../../../config/axios-config.js';
import './SheetShare.scss';
import { useParams } from 'react-router-dom';
import { IoCopy } from 'react-icons/io5';
import { IoMdCheckmark } from 'react-icons/io';

export const fetchShortUrl = async (url, textId) => {
  const { data } = await axiosInstance.post('/api/v1/share', { 
    text_id: textId,
    language: "bo",
    url,
  });
  return data;
};


const SheetShare = () => {
  const url = window.location.href
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);
  const { sheetSlugAndId } = useParams();
  const textId = sheetSlugAndId.split('_').pop();

  const { data: shorturlData, isLoading } = useQuery(
    ["shortUrl", url, textId, isOpen],
    () => fetchShortUrl(url, textId),
    {
      refetchOnWindowFocus: false,
      enabled: isOpen,
      retry: false,
    }
  );

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

  // ----------------------------- renderers -------------------------------------

  return (
    <div className="sheet-share-container" ref={dropdownRef}>
      <button 
        className="share-button" 
        onClick={()=>setIsOpen(!isOpen)}
      >
        <FiShare2 />
      </button>

      {isOpen && (
        <div className="share-dropdown">
          <button 
            className="share-option" 
            onClick={()=>{
              navigator.clipboard.writeText(shorturlData?.shortUrl || url);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 3000);
            }}
            disabled={isLoading}
          >
            {copied ? <IoMdCheckmark className='share-icon' size={16}/> : <IoCopy className='share-icon' size={16}/>}
            <span>{isLoading ? "Loading..." : "Copy link"}</span>
          </button>
          
          <a 
            className="share-option" 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shorturlData?.shortUrl ||  url)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter className="share-icon" />
            <span>Share on X</span>
          </a>
          
          <a 
            className="share-option" 
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shorturlData?.shortUrl || url)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook className="share-icon" />
            <span>Share on Facebook</span>
          </a>
          
        </div>
      )}
    </div>
  );
};

export default SheetShare;