import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
  ResumePDFText,
  ResumePDFLink,
} from "components/Resume/ResumePDF/common";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import type { ResumeProject } from "lib/redux/types";
import { formatUrl } from "./common/utils";

export const ResumePDFProject = ({
  heading,
  projects,
  themeColor,
  isPDF
}: {
  heading: string;
  projects: ResumeProject[];
  themeColor: string;
  isPDF: boolean;
}) => {
  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      {projects.map(({ project, date, descriptions, url }, idx) => (
        <View key={idx}>
          <View
            style={{
              ...styles.flexRowBetween,
              marginTop: spacing["0.5"],
            }}
          >
            {formatUrl(url) ? (
              <ResumePDFLink src={formatUrl(url)} isPDF={isPDF}>
                <ResumePDFText bold={true}>{project}</ResumePDFText>
              </ResumePDFLink>
            ) : (
              <ResumePDFText>{project}</ResumePDFText>
            )}
            <ResumePDFText>{date}</ResumePDFText>
          </View>
          <View style={{ ...styles.flexCol, marginTop: spacing["0.5"] }}>
            <ResumePDFBulletList items={descriptions} />
          </View>
        </View>
      ))}
    </ResumePDFSection>
  );
};
