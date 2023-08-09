import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
  ResumePDFText,
  ResumePDFLink,
} from "components/Resume/ResumePDF/common";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import type { ResumeWorkExperience } from "lib/redux/types";
import { ResumePDFIcon } from "./common/ResumePDFIcon";

export const ResumePDFWorkExperience = ({
  heading,
  workExperiences,
  themeColor,
  isPDF,
}: {
  heading: string;
  workExperiences: ResumeWorkExperience[];
  themeColor: string;
  isPDF: boolean;
}) => {
  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      {workExperiences.map(
        ({ company, link, jobTitle, date, descriptions }, idx) => {
          // Hide company name if it is the same as the previous company
          const hideCompanyName =
            idx > 0 && company === workExperiences[idx - 1].company;

          return (
            <View
              key={idx}
              style={idx !== 0 ? { marginTop: spacing["2"] } : {}}
            >
              {!hideCompanyName && (
                <View
                  style={{
                    ...styles.flexRow,
                    alignItems: "center",
                    gap: spacing["1"],
                  }}
                >
                  <ResumePDFLink src={link} isPDF={isPDF}>
                    {<ResumePDFText bold={true}>{company}</ResumePDFText>}
                  </ResumePDFLink>
                  {link && (
                    <ResumePDFIcon type="url" isPDF={isPDF}></ResumePDFIcon>
                  )}
                </View>
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
                <ResumePDFText>{date}</ResumePDFText>
              </View>
              <View style={{ ...styles.flexCol, marginTop: spacing["1.5"] }}>
                <ResumePDFBulletList items={descriptions} />
              </View>
            </View>
          );
        }
      )}
    </ResumePDFSection>
  );
};
