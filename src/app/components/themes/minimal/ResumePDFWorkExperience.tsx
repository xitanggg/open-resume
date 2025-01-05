import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
  ResumePDFText,
} from "./common";
import { styles, spacing } from "components/themes/styles";
import type { ResumeWorkExperience } from "lib/redux/types";
import { DEFAULT_ALT_COLOR, DEFAULT_SUBTITLE_COLOR } from "./common/constants";

export const ResumePDFWorkExperience = ({
  heading,
  workExperiences,
  themeColor,
}: {
  heading: string;
  workExperiences: ResumeWorkExperience[];
  themeColor: string;
}) => {
  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      {workExperiences.map(({ company, jobTitle, date, descriptions }, idx) => {
        // Hide company name if it is the same as the previous company
        const hideCompanyName =
          idx > 0 && company === workExperiences[idx - 1].company;

        return (
          <View key={idx} style={idx !== 0 ? { marginTop: spacing["2"] } : {}}>
            {!hideCompanyName && (
              <ResumePDFText bold={true} color={DEFAULT_SUBTITLE_COLOR}>{company}</ResumePDFText>
            )}
            <View
              style={{
                ...styles.flexRowBetween,
                marginTop: hideCompanyName
                  ? "-" + spacing["1"]
                  : spacing["1.5"],
              }}
            >
              <ResumePDFText>{jobTitle}</ResumePDFText>
              <ResumePDFText color={DEFAULT_ALT_COLOR}>{date}</ResumePDFText>
            </View>
            <View style={{ ...styles.flexCol, marginTop: spacing["1.5"] }}>
              <ResumePDFBulletList items={descriptions} />
            </View>
          </View>
        );
      })}
    </ResumePDFSection>
  );
};
