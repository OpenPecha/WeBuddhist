import React, { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { BiSearch } from 'react-icons/bi';
import { useTranslate } from '@tolgee/react';
import './IndividualTextSearch.scss';

const IndividualTextSearch = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslate();

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="individual-text-search">
      <div className="search-header">
        <h2>{t('connection_panel.search_in_this_text')}</h2>
        <IoMdClose
          size={24}
          onClick={onClose}
          className="close-icon"
        />
      </div>
      
      <div className="search-container">
        <form onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <BiSearch className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('connection_panel.search_in_this_text')}
              className="search-input"
            />
          </div>
        </form>
      </div>
      
      <div className="search-results">
        {/* Search results */}
      </div>
    </div>
  );
};

export default IndividualTextSearch;