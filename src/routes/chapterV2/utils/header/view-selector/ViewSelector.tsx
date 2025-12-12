import React from "react";
import { useTranslate } from "@tolgee/react";
import { ImParagraphJustify } from "react-icons/im";
import { LuAlignJustify } from "react-icons/lu";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu.tsx";

export const VIEW_MODES = {
  SOURCE: "SOURCE",
  TRANSLATIONS: "TRANSLATIONS",
  SOURCE_AND_TRANSLATIONS: "SOURCE_AND_TRANSLATIONS",
};

export const LAYOUT_MODES = {
  SEGMENTED: "SEGMENTED",
  PROSE: "PROSE",
};

const options = [
  {
    id: "1",
    label: "text.reader_option_menu.source",
    value: VIEW_MODES.SOURCE,
  },
  {
    id: "2",
    label: "text.reader_option_menu.translation",
    value: VIEW_MODES.TRANSLATIONS,
  },
  {
    id: "3",
    label: "text.reader_option_menu.source_with_translation",
    value: VIEW_MODES.SOURCE_AND_TRANSLATIONS,
  },
];

const layoutOptions = [
  {
    id: "layout-1",
    icon: <ImParagraphJustify className="size-5" />,
    value: LAYOUT_MODES.PROSE,
    label: "Prose layout",
  },
  {
    id: "layout-2",
    icon: <LuAlignJustify className="size-5" />,
    value: LAYOUT_MODES.SEGMENTED,
    label: "Segmented layout",
  },
];

type ViewSelectorProps = {
  viewMode: string;
  setViewMode: (viewMode: string) => void;
  layoutMode: string;
  setLayoutMode: (layoutMode: string) => void;
  versionSelected?: boolean;
};

const ViewSelector = ({
  versionSelected,
  viewMode,
  setViewMode,
  layoutMode,
  setLayoutMode,
}: ViewSelectorProps) => {
  const { t } = useTranslate();

  const renderViewModeOptions = () => {
    return (
      <div className="flex flex-col p-2 space-y-2">
        <DropdownMenuRadioGroup
          className="space-y-2"
          value={viewMode}
          onValueChange={setViewMode}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.id}
              value={option.value}
              className="flex items-center gap-2 rounded-md border px-3 py-2 data-[state=checked]:border-primary data-[state=checked]:bg-primary/5"
            >
              <span className="text-sm text-foreground">{t(option.label)}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {renderViewModeOptions()}
      <DropdownMenuLabel className="text-sm font-medium text-[#676767]">
        {t("text.reader_option_menu.layout")}
      </DropdownMenuLabel>
      <DropdownMenuRadioGroup
        value={layoutMode}
        onValueChange={setLayoutMode}
        className="grid grid-cols-2 gap-2"
      >
        {layoutOptions.map((option) => (
          <DropdownMenuRadioItem
            key={option.id}
            value={option.value}
            className="flex items-center gap-2 rounded-md border px-3 py-2 data-[state=checked]:border-primary data-[state=checked]:bg-primary/5"
          >
            <span className="text-muted-foreground">{option.icon}</span>
            <span className="text-sm text-foreground">{option.label}</span>
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </div>
  );
};

export default React.memo(ViewSelector);
