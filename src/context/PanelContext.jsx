import React, { createContext, useContext, useState } from 'react';

const PanelContext = createContext();

export const PanelProvider = ({ children }) => {
  const [isResourcesPanelOpen, setIsResourcesPanelOpen] = useState(false);
  const [isTranslationSourceOpen, setIsTranslationSourceOpen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isViewSelectorOpen, setIsViewSelectorOpen] = useState(false);

 
  const openResourcesPanel = () => {
    setIsResourcesPanelOpen(true);
    setIsTranslationSourceOpen(false);
  };

  const closeResourcesPanel = () => {
    setIsResourcesPanelOpen(false);
  };

  const toggleResourcesPanel = () => {
    setIsResourcesPanelOpen(prev => {
      const newState = !prev;
      // If opening Resources panel, close TranslationSource
      if (newState) {
        setIsTranslationSourceOpen(false);
      }
      return newState;
    });
  };

  const openTranslationSource = () => {
    setIsTranslationSourceOpen(true);
    setIsResourcesPanelOpen(false);
  };

  const closeTranslationSource = () => {
    setIsTranslationSourceOpen(false);
  };

  const toggleTranslationSource = () => {
    setIsTranslationSourceOpen(prev => {
      const newState = !prev;
      // If opening TranslationSource, close Resources panel
      if (newState) {
        setIsResourcesPanelOpen(false);
      }
      return newState;
    });
  };

  const openLeftPanel = () => {
    setIsLeftPanelOpen(true);
  };

  const closeLeftPanel = () => {
    setIsLeftPanelOpen(false);
  };

  const toggleLeftPanel = () => {
    setIsLeftPanelOpen(prev => {
      const newState = !prev;
      return newState;
    });
  };

  const value = {
    isResourcesPanelOpen,
    isTranslationSourceOpen,
    isLeftPanelOpen,
    isViewSelectorOpen,
    setIsViewSelectorOpen,
    openResourcesPanel,
    closeResourcesPanel,
    toggleResourcesPanel,
    openTranslationSource,
    closeTranslationSource,
    toggleTranslationSource,
    openLeftPanel,
    closeLeftPanel,
    toggleLeftPanel
  };

  return (
    <PanelContext.Provider value={value}>
      {children}
    </PanelContext.Provider>
  );
};

export const usePanelContext = () => {
  const context = useContext(PanelContext);
  if (!context) {
    throw new Error('usePanelContext must be used within a PanelProvider');
  }
  return context;
};
