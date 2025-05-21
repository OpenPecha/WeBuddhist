import React from 'react';
import { useTranslate } from '@tolgee/react';
import './Sheets.scss';
import { Button } from 'react-bootstrap';

const Sheets = () => {
  const { t } = useTranslate();
  
  return (
    <div className="sheets-tab">
      <p className="results-message">
        {t('search.zero_result', 'No results to display.')}
      </p>
      <div className="pagination-container">
        <Button 
          variant="outline-secondary" 
          className="pagination-btn prev-btn"
          disabled={true} 
        >
          &laquo;
        </Button>
        <Button 
          variant="outline-secondary" 
          className="pagination-btn next-btn"
        >
          &raquo;
        </Button>
      </div>
    </div>
  );
};

export default Sheets;