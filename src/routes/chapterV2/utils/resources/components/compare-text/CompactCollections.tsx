import { useTranslate } from "@tolgee/react";

const CompactCollections = ({
  collectionsData,
  renderCollectionNames,
  getColorFromIndex,
}: any) => {
  const { t } = useTranslate();
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl text-start font-semibold text-[#656565]">
        {t("home.browse_text")}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {collectionsData?.collections.map((collection: any, index: number) => (
          <div className="w-full" key={collection.id}>
            <div
              className="h-1 w-full mb-4"
              style={{ backgroundColor: getColorFromIndex(index) }}
            />
            {renderCollectionNames(collection, index)}
            <p className="content text-left text-[#666666] text-base m-0 wrap-break-word">
              {collection.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompactCollections;
