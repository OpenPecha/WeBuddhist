import { useRef, useState } from "react";
import { useTranslate } from "@tolgee/react";
import Collections from "@/routes/collections/Collections";
import Works from "@/routes/works/Works";
import Texts from "@/routes/texts/Texts";
import ResourceHeader from "../common/ResourceHeader";

type RendererInfo = {
  renderer: string;
  requiredId: string;
};

const CompareText = ({
  setIsCompareTextView,
  addChapter,
  currentChapter,
  handleNavigate,
}: any) => {
  const [rendererInfo, setRendererInfo] = useState<RendererInfo>({
    renderer: "collections",
    requiredId: "",
  });
  const historyRef = useRef<RendererInfo[]>([]);

  const { t } = useTranslate();

  const handleSetRendererInfo = (updater: any) => {
    setRendererInfo((prev) => {
      historyRef.current.push(prev);
      return updater(prev);
    });
  };

  const renderView = () => {
    switch (rendererInfo.renderer) {
      case "collections":
        return (
          <Collections
            setRendererInfo={handleSetRendererInfo}
            isCompactView={true}
          />
        );
      case "works":
        return (
          <Works
            setRendererInfo={handleSetRendererInfo}
            collection_id={rendererInfo.requiredId}
            isCompactView={true}
          />
        );
      case "texts":
        return (
          <Texts
            setRendererInfo={handleSetRendererInfo}
            collection_id={rendererInfo.requiredId}
            addChapter={addChapter}
            currentChapter={currentChapter}
            isCompactView={true}
          />
        );
    }
  };

  return (
    <div className="compare-text-container">
      <ResourceHeader
        title={t("connection_panel.compare_text")}
        onBack={handleNavigate}
        onClose={() => setIsCompareTextView("main")}
      />
      <div className="compare-text-content">{renderView()}</div>
    </div>
  );
};
export default CompareText;
