import React from 'react';
import { useTranslate } from '@tolgee/react';
import './Sheets.scss';

const Sheets = () => {
  const { t } = useTranslate();
  
  return (
    <div className="sheets-tab">
      <p className="results-message">
        {t('search.zero_result', 'No results to display.')}
      </p>
    </div>
  );
};

export default Sheets;