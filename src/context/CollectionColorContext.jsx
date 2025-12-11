import React, { createContext, useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const CollectionColorContext = createContext({
  collectionColor: null,
  setCollectionColor: () => {}
});

export const CollectionColorProvider = ({ children }) => {
  const [collectionColor, setCollectionColor] = useState(null);

  const contextValue = useMemo(() => ({
    collectionColor,
    setCollectionColor
  }), [collectionColor]);

  return (
    <CollectionColorContext.Provider value={contextValue}>
      {children}
    </CollectionColorContext.Provider>
  );
};

CollectionColorProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useCollectionColor = () => useContext(CollectionColorContext);

