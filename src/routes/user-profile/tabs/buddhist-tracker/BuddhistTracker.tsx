import React from 'react';
import { useTranslate } from "@tolgee/react";

const BuddhistTracker = () => {
  const { t } = useTranslate();
  
  return (
    <div className="tab-content">
      <h3>{t("profile.buddhish_text_tracker")}</h3>
      <p>{t("profile.text_tracker.descriptions")}</p>
    </div>
  );
};

export default BuddhistTracker;