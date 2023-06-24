import type { GeneralSetting } from "lib/redux/settingsSlice";
import { PX_PER_PT } from "lib/constants";
import {
  FONT_FAMILY_TO_STANDARD_SIZE_IN_PT,
  FONT_FAMILIES,
  type FontFamily,
} from "public/fonts/fonts";

const Selection = ({
  selectedColor,
  isSelected,
  style = {},
  onClick,
  children,
}: {
  selectedColor: string;
  isSelected: boolean;
  style?: React.CSSProperties;
  onClick: () => void;
  children: React.ReactNode;
}) => {
  const selectedStyle = {
    color: "white",
    backgroundColor: selectedColor,
    borderColor: selectedColor,
    ...style,
  };

  return (
    <div
      className="flex w-[105px] cursor-pointer items-center justify-center rounded-md border border-gray-300 py-1.5 shadow-sm hover:border-gray-400 hover:bg-gray-100"
      onClick={onClick}
      style={isSelected ? selectedStyle : style}
      onKeyDown={(e) => {
        if (["Enter", " "].includes(e.key)) onClick();
      }}
      tabIndex={0}
    >
      {children}
    </div>
  );
};

const SelectionsWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="mt-2 flex flex-wrap gap-3">{children}</div>;
};

export const FontFamilySelections = ({
  selectedFontFamily,
  themeColor,
  handleSettingsChange,
}: {
  selectedFontFamily: string;
  themeColor: string;
  handleSettingsChange: (field: GeneralSetting, value: string) => void;
}) => {
  return (
    <SelectionsWrapper>
      {FONT_FAMILIES.map((fontFamily, idx) => {
        const isSelected = selectedFontFamily === fontFamily;
        const standardSizePt = FONT_FAMILY_TO_STANDARD_SIZE_IN_PT[fontFamily];
        return (
          <Selection
            key={idx}
            selectedColor={themeColor}
            isSelected={isSelected}
            style={{
              fontFamily,
              fontSize: `${standardSizePt * PX_PER_PT}px`,
            }}
            onClick={() => handleSettingsChange("fontFamily", fontFamily)}
          >
            {fontFamily.split(/(?=[A-Z])/).join(" ")}
          </Selection>
        );
      })}
    </SelectionsWrapper>
  );
};

export const FontSizeSelections = ({
  selectedFontSize,
  fontFamily,
  themeColor,
  handleSettingsChange,
}: {
  fontFamily: FontFamily;
  themeColor: string;
  selectedFontSize: string;
  handleSettingsChange: (field: GeneralSetting, value: string) => void;
}) => {
  const standardSizePt = FONT_FAMILY_TO_STANDARD_SIZE_IN_PT[fontFamily];
  const compactSizePt = standardSizePt - 1;

  return (
    <SelectionsWrapper>
      {["Compact", "Standard", "Large"].map((type, idx) => {
        const fontSizePt = String(compactSizePt + idx);
        const isSelected = fontSizePt === selectedFontSize;
        return (
          <Selection
            key={idx}
            selectedColor={themeColor}
            isSelected={isSelected}
            style={{
              fontFamily,
              fontSize: `${Number(fontSizePt) * PX_PER_PT}px`,
            }}
            onClick={() => handleSettingsChange("fontSize", fontSizePt)}
          >
            {type}
          </Selection>
        );
      })}
    </SelectionsWrapper>
  );
};

export const DocumentSizeSelections = ({
  selectedDocumentSize,
  themeColor,
  handleSettingsChange,
}: {
  themeColor: string;
  selectedDocumentSize: string;
  handleSettingsChange: (field: GeneralSetting, value: string) => void;
}) => {
  return (
    <SelectionsWrapper>
      {["Letter", "A4"].map((type, idx) => {
        return (
          <Selection
            key={idx}
            selectedColor={themeColor}
            isSelected={type === selectedDocumentSize}
            onClick={() => handleSettingsChange("documentSize", type)}
          >
            <div className="flex flex-col items-center">
              <div>{type}</div>
              <div className="text-xs">
                {type === "Letter" ? "(US, Canada)" : "(other countries)"}
              </div>
            </div>
          </Selection>
        );
      })}
    </SelectionsWrapper>
  );
};
