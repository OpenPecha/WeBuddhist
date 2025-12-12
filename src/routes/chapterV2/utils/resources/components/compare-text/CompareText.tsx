import { useRef, useState } from "react";
import { useTranslate } from "@tolgee/react";
import Collections from "@/routes/collections/Collections";
import Works from "@/routes/works/Works";
import Texts from "@/routes/texts/Texts";
import ResourceHeader from "../common/ResourceHeader";

const CompareText = ({
  setIsCompareTextView,
  addChapter,
  currentChapter,
  handleNavigate,
}: any) => {
  const [rendererInfo, setRendererInfo] = useState({
    renderer: "collections",
    requiredId: "",
  });
  const historyRef = useRef([]);

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
            requiredInfo={{ from: "compare-text" }}
            setRendererInfo={handleSetRendererInfo}
            collection_id={rendererInfo.requiredId}
          />
        );
      case "texts":
        return (
          <Texts
            requiredInfo={{ from: "compare-text" }}
            setRendererInfo={handleSetRendererInfo}
            collection_id={rendererInfo.requiredId}
            addChapter={addChapter}
            currentChapter={currentChapter}
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
