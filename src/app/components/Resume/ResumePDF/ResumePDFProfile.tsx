import { View } from "@react-pdf/renderer";
import {
  ResumePDFIcon,
} from "components/Resume/ResumePDF/common/ResumePDFIcon";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import {
  ResumePDFLink,
  ResumePDFSection,
  ResumePDFText,
} from "components/Resume/ResumePDF/common";
import type { ResumeProfile } from "lib/redux/types";

const ProfileItem = ({
  iconType,
  value,
  isPDF,
}: {
  iconType: "email" | "phone" | "location" | "github" | "linkedIn" | "portfolio";
  value: string;
  isPDF: boolean;
}) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {

    let src = "";
    switch (iconType) {
      case "email": {
        src = `mailto:${value}`;
        break;
      }
      case "phone": {
        src = `tel:${value.replace(/[^\d+]/g, "")}`; // Keep only + and digits
        break;
      }
      case "linkedIn": {
        src = `https://www.linkedin.com/in/${value}`;
        break;
      }
      case "github": {
        src = `https://github.com/${value}`;
        break;
      }
      case "portfolio": {
        src = value.startsWith("http") ? value : `https://${value}`;
        break;
      }
      default: {
        src = value;
        break;
      }
    }

    return (
      <ResumePDFLink src={src} isPDF={isPDF}>
        {children}
      </ResumePDFLink>
    );
  };

  return (
    <View
      style={{
        ...styles.flexRow,
        alignItems: "center",
        gap: spacing["1"],
        width: "33.33%",
        marginBottom: spacing["2"],
      }}
    >
      <ResumePDFIcon type={iconType} isPDF={isPDF} />
      <Wrapper>
        <ResumePDFText>{value}</ResumePDFText>
      </Wrapper>
    </View>
  );
};

export const ResumePDFProfile = ({
  profile,
  themeColor,
  isPDF,
}: {
  profile: ResumeProfile;
  themeColor: string;
  isPDF: boolean;
}) => {
  const { name, email, phone, linkedIn, summary, location, github, portfolio } = profile;

  return (
    <ResumePDFSection style={{ marginTop: spacing["4"] }}>
      <ResumePDFText
        bold={true}
        themeColor={themeColor}
        style={{ fontSize: "20pt" }}
      >
        {name}
      </ResumePDFText>
      {summary && <ResumePDFText>{summary}</ResumePDFText>}
      <View
        style={{
          ...styles.flexRow,
          flexWrap: "wrap",
          marginTop: spacing["1"],
        }}
      >
        {email && (
          <ProfileItem iconType="email" value={email} isPDF={isPDF} />
        )}
        {phone && (
          <ProfileItem iconType="phone" value={phone} isPDF={isPDF} />
        )}
        {location && (
          <ProfileItem iconType="location" value={location} isPDF={isPDF} />
        )}
        {linkedIn && (
          <ProfileItem iconType="linkedIn" value={linkedIn} isPDF={isPDF} />
        )}
        {github && (
          <ProfileItem iconType="github" value={github} isPDF={isPDF} />
        )}
        {portfolio && ( 
          <ProfileItem iconType="portfolio" value={portfolio} isPDF={isPDF} />
        )}  
      </View>
    </ResumePDFSection>
  );
};
