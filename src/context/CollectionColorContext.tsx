import { createContext, useContext, useState, useMemo } from "react";

const CollectionColorContext = createContext({
  collectionColor: null,
  setCollectionColor: () => {},
});

export const CollectionColorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [collectionColor, setCollectionColor] = useState(null);

  const contextValue = useMemo(
    () => ({
      collectionColor,
      setCollectionColor,
    }),
    [collectionColor],
  );

  return (
    <CollectionColorContext.Provider value={contextValue}>
      {children}
    </CollectionColorContext.Provider>
  );
};

export const useCollectionColor = () => useContext(CollectionColorContext);
