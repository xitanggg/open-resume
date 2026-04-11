import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
  ResumePDFText,
} from "components/Resume/ResumePDF/common";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import type { ResumeCustom } from "lib/redux/types";

export const ResumePDFCustom = ({
  heading,
  custom,
  themeColor,
  showBulletPoints,
  customDisplayMode = "bullet",
}: {
  heading: string;
  custom: ResumeCustom;
  themeColor: string;
  showBulletPoints: boolean;
  customDisplayMode?: "bullet" | "comma";
}) => {
  const { descriptions } = custom;

  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      <View
        style={
          customDisplayMode === "comma"
            ? { flexDirection: "row", flexWrap: "wrap", gap: spacing["1.5"], marginTop: spacing["0.5"] }
            : { ...styles.flexCol }
        }
      >
        {customDisplayMode === "comma" ? (
          descriptions.map((desc, idx) => (
            <View
              key={idx}
              style={{
                border: `1pt solid ${themeColor}`,
                borderRadius: "3pt",
                paddingTop: "2pt",
                paddingBottom: "2pt",
                paddingLeft: spacing["2"],
                paddingRight: spacing["2"],
                backgroundColor: themeColor + "20",
              }}
            >
              <ResumePDFText style={{ lineHeight: "1.3" }}>
                {desc}
              </ResumePDFText>
            </View>
          ))
        ) : (
          <ResumePDFBulletList
            items={descriptions}
            showBulletPoints={showBulletPoints}
          />
        )}
      </View>
    </ResumePDFSection>
  );
};
