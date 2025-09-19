import { View, Link, Text } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
  ResumePDFText,
} from "components/Resume/ResumePDF/common";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import type { ResumeProject } from "lib/redux/types";

export const ResumePDFProject = ({
  heading,
  projects,
  themeColor,
}: {
  heading: string;
  projects: ResumeProject[];
  themeColor: string;
}) => {
  if (projects.length === 0) {
    return null;
  }

  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      {projects.map((project, idx) => (
        <ProjectEntry
          key={idx}
          project={project}
          themeColor={themeColor}
          isFirst={idx === 0}
        />
      ))}
    </ResumePDFSection>
  );
};

const ProjectEntry = ({
  project,
  themeColor,
  isFirst,
}: {
  project: ResumeProject;
  themeColor: string;
  isFirst: boolean;
}) => {
  const {
    project: projectName,
    date,
    descriptions,
    github,
    demo,
  } = project;

  return (
    <View style={{ marginTop: isFirst ? 0 : spacing["0.5"] }}>
      <View style={styles.flexRowBetween}>
        <View style={{ ...styles.flexRow, alignItems: "center" }}>
          <ResumePDFText bold={true}>{projectName}</ResumePDFText>
          <ProjectLinks
            github={github}
            demo={demo}
            themeColor={themeColor}
          />
        </View>
        <ResumePDFText>{date}</ResumePDFText>
      </View>
      <View style={{ ...styles.flexCol, marginTop: spacing["0.5"] }}>
        <ResumePDFBulletList items={descriptions} />
      </View>
    </View>
  );
};

const ProjectLinks = ({
  github,
  demo,
  themeColor,
}: {
  github?: string;
  demo?: string;
  themeColor: string;
}) => {
  if (!github && !demo) {
    return null;
  }

  const ensureUrlHasProtocol = (url: string) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }
    return url;
  };

  const linkStyle = { color: themeColor };

  return (
    <View
      style={{
        ...styles.flexRow,
        alignItems: "center",
        marginLeft: spacing["1"],
      }}
    >
      {github && (
        <Link src={ensureUrlHasProtocol(github)}>
          <Text style={linkStyle}>Github</Text>
        </Link>
      )}

      {github && demo && (
        <Text style={{ marginHorizontal: spacing["0.5"] }}></Text>
      )}

      {demo && (
        <Link src={ensureUrlHasProtocol(demo)}>
          <Text style={linkStyle}>Demo</Text>
        </Link>
      )}
    </View>
  );
};