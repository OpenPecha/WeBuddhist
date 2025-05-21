import React from 'react';
import { useTranslate } from '@tolgee/react';
import './Sources.scss';

const Sources = () => {
  const { t } = useTranslate();
  
  return (
    <div className="sources-tab">
      <p className="results-message">
        {t('search.zero_result', 'No results to display.')}
      </p>
    </div>
  );
};

export default Sources;