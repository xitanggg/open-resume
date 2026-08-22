import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
  ResumePDFText,
  ResumePDFLink,
} from "components/Resume/ResumePDF/common";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import type { ResumeProject } from "lib/redux/types";

export const ResumePDFProject = ({
  heading,
  projects,
  themeColor,
  isPDF,
}: {
  heading: string;
  projects: ResumeProject[];
  themeColor: string;
  isPDF?: boolean;
}) => {
  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      {projects.map(({ project, date, url, descriptions }, idx) => {
        const formattedUrl = url
          ? url.startsWith("http")
            ? url
            : `https://${url}`
          : "";

        return (
          <View key={idx}>
            <View
              style={{
                ...styles.flexRowBetween,
                marginTop: spacing["0.5"],
              }}
            >
              <View style={{ ...styles.flexRow, alignItems: "center" }}>
                <ResumePDFText bold={true}>{project}</ResumePDFText>
                {url && (
                  <>
                    <ResumePDFText>&nbsp;|&nbsp;</ResumePDFText>
                    <ResumePDFLink src={formattedUrl} isPDF={Boolean(isPDF)}>
                      <ResumePDFText bold={false}>{url}</ResumePDFText>
                    </ResumePDFLink>
                  </>
                )}
              </View>
              <ResumePDFText>{date}</ResumePDFText>
            </View>
            <View style={{ ...styles.flexCol, marginTop: spacing["0.5"] }}>
              <ResumePDFBulletList items={descriptions} />
            </View>
          </View>
        );
      })}
    </ResumePDFSection>
  );
};
