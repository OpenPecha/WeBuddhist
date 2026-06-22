import type { MouseEvent } from "react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListOl,
  FaListUl,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaQuoteLeft,
  FaCode,
  FaImage,
} from "react-icons/fa";
import { useCustomEditor } from "../../sheet-utils/CustomEditor";
import MarkButton from "./MarkButton";
import BlockButton from "./blockButton";
import pechaIcon from "../../../../assets/icons/pecha_icon.png";
import { useTranslate } from "@tolgee/react";
import { createPayload } from "../../sheet-utils/Constant";
import { updateSheet } from "../Editors/EditorWrapper";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Toolsbar = (prop: any) => {
  const { editor, value, title, sheetId, saveStatus } = prop;
  const customEditor = useCustomEditor();
  const { t } = useTranslate();
  const navigate = useNavigate();

  const handlePublish = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!sheetId) {
      toast.error(t("Sheet id missing."));
      return;
    }
    try {
      const payload = createPayload(
        value,
        title || sessionStorage.getItem("sheet-title") || "",
        true,
      );
      await updateSheet(sheetId, payload);
      toast.success(t("Sheet published successfully!"));
      setTimeout(() => {
        navigate("/note");
      }, 2000);
    } catch (error) {
      toast.error(t("Failed to publish sheet."));
    }
  };

  const getSaveStatusIndicator = () => {
    const statusClass =
      saveStatus === "saving"
        ? "bg-[rgb(226,150,11)]"
        : saveStatus === "saved"
          ? "bg-[#0aa01c]"
          : "bg-gray-300";
    return (
      <span
        className={`inline-block w-3 h-3 rounded-full ml-2.5 align-middle transition-colors duration-300 ${statusClass}`}
      />
    );
  };

  const renderMarkButtons = () => {
    return (
      <div className="flex items-center gap-0.5">
        <MarkButton format="bold" title={t("Bold")}>
          <FaBold />
        </MarkButton>
        <MarkButton format="italic" title={t("Italic")}>
          <FaItalic />
        </MarkButton>
        <MarkButton format="underline" title={t("Underline")}>
          <FaUnderline />
        </MarkButton>
      </div>
    );
  };

  const renderWebuddhistIconSection = () => {
    return (
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="w-7 h-7 md:w-8 md:h-8 text-gray-600 text-sm hover:bg-gray-200 hover:text-gray-800 active:bg-gray-300 active:text-black"
          title={t("Pecha Segment")}
          onMouseDown={(e) => {
            e.preventDefault();
            customEditor.toggleSheetSegment(editor);
          }}
        >
          <img
            src={pechaIcon}
            style={{ width: "20px", height: "20px" }}
            alt="source"
          />
        </Button>
      </div>
    );
  };

  const renderListButtons = () => {
    return (
      <div className="flex items-center gap-0.5">
        <BlockButton format="ordered-list" title={t("Ordered List")}>
          <FaListOl />
        </BlockButton>
        <BlockButton format="unordered-list" title={t("Unordered List")}>
          <FaListUl />
        </BlockButton>
      </div>
    );
  };

  const renderAlignmentButtons = () => {
    return (
      <div className="flex items-center gap-0.5">
        <BlockButton format="left" title={t("Align Left")}>
          <FaAlignLeft />
        </BlockButton>
        <BlockButton format="center" title={t("Align Center")}>
          <FaAlignCenter />
        </BlockButton>
        <BlockButton format="right" title={t("Align Right")}>
          <FaAlignRight />
        </BlockButton>
        <BlockButton format="justify" title={t("Justify")}>
          <FaAlignJustify />
        </BlockButton>
      </div>
    );
  };

  const renderUtilityButtons = () => {
    return (
      <div className="flex items-center gap-0.5">
        <BlockButton format="block-quote" title={t("Block Quote")}>
          <FaQuoteLeft />
        </BlockButton>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="w-7 h-7 md:w-8 md:h-8 text-gray-600 text-sm hover:bg-gray-200 hover:text-gray-800 active:bg-gray-300 active:text-black"
          title={t("Code Block")}
          onMouseDown={(e) => {
            e.preventDefault();
            customEditor.toggleCodeBlock(editor);
          }}
        >
          <FaCode />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="w-7 h-7 md:w-8 md:h-8 text-gray-600 text-sm hover:bg-gray-200 hover:text-gray-800 active:bg-gray-300 active:text-black"
          title={t("Insert Image")}
          onMouseDown={(e) => {
            e.preventDefault();
            customEditor.toggleImage(editor);
          }}
        >
          <FaImage />
        </Button>
      </div>
    );
  };

  const renderActionButtons = () => {
    return (
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          disabled={!sheetId}
          size="sm"
          className="h-8 px-[10px] text-sm text-[#f4f4f4] bg-[#A9080E] hover:bg-[#8e070c]"
          title={t("Publish Sheet")}
          onClick={handlePublish}
        >
          {t("publish")}
        </Button>
        {getSaveStatusIndicator()}
      </div>
    );
  };

  return (
    <div className="flex items-center p-[6px] md:p-2 mx-auto mb-3 flex-wrap gap-1">
      {renderMarkButtons()}
      <div className="w-px h-5 md:h-6 bg-gray-200 mx-1.5" />
      {renderWebuddhistIconSection()}
      <div className="w-px h-5 md:h-6 bg-gray-200 mx-1.5" />
      {renderListButtons()}
      <div className="w-px h-5 md:h-6 bg-gray-200 mx-1.5" />
      {renderAlignmentButtons()}
      <div className="w-px h-5 md:h-6 bg-gray-200 mx-1.5" />
      {renderUtilityButtons()}
      <div className="w-px h-5 md:h-6 bg-gray-200 mx-1.5" />
      {renderActionButtons()}
    </div>
  );
};

export default Toolsbar;
