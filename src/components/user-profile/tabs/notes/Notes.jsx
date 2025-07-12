import React from 'react';
import { useTranslate } from "@tolgee/react";

const Notes = () => {
  const { t } = useTranslate();
  
  return (
    <div className="tab-content">
      <h3>{t("user_profile.notes")}</h3>
      <p>{t("profile.notes.description")}</p>
    </div>
  );
};

export default Notes;