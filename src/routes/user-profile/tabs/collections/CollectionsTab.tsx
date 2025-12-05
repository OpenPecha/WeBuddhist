import React from 'react';
import { useTranslate } from "@tolgee/react";

const CollectionsTab = () => {
  const { t } = useTranslate();
  
  return (
    <div className="tab-content">
      <h3>{t("profile.tab.collection")}</h3>
      <p>{t("profile.tab.collection.description")}</p>
    </div>
  );
};

export default CollectionsTab;