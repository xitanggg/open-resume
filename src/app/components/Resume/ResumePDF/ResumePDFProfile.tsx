import { View } from "@react-pdf/renderer";
import {
  ResumePDFIcon,
  type IconType,
} from "components/Resume/ResumePDF/common/ResumePDFIcon";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import {
  ResumePDFLink,
  ResumePDFSection,
  ResumePDFText,
} from "components/Resume/ResumePDF/common";
import type { ResumeProfile } from "lib/redux/types";

const DEFAULT_CONTACT_ORDER = ["email", "phone", "url", "github", "location"];

export const ResumePDFProfile = ({
  profile,
  themeColor,
  isPDF,
  contactOrder,
}: {
  profile: ResumeProfile;
  themeColor: string;
  isPDF: boolean;
  contactOrder?: string[];
}) => {
  const { name, email, phone, url, summary, location, github } = profile;
  const iconPropsMap: Record<string, string> = {
    email,
    phone,
    location,
    url,
    github,
  };

  const orderedFields =
    contactOrder && contactOrder.length > 0
      ? contactOrder
      : DEFAULT_CONTACT_ORDER;

  return (
    <ResumePDFSection style={{ marginTop: spacing["4"] }}>
      <ResumePDFText
        bold={true}
        themeColor={themeColor}
        style={{ fontSize: "20pt" }}
      >
        {name}
      </ResumePDFText>
      <View
        style={{
          ...styles.flexRowBetween,
          flexWrap: "wrap",
          marginTop: spacing["0.5"],
        }}
      >
        {orderedFields.map((key) => {
          const value = iconPropsMap[key];
          if (!value) return null;

          let iconType: IconType = "url";
          if (key === "email") {
            iconType = "email";
          } else if (key === "phone") {
            iconType = "phone";
          } else if (key === "location") {
            iconType = "location";
          } else if (key === "github") {
            iconType = "url_github";
          } else if (key === "url") {
            if (value.includes("github")) {
              iconType = "url_github";
            } else if (value.includes("linkedin")) {
              iconType = "url_linkedin";
            } else {
              iconType = "url";
            }
          }

          const shouldUseLinkWrapper = ["email", "url", "phone", "github"].includes(key);
          const Wrapper = ({ children }: { children: React.ReactNode }) => {
            if (!shouldUseLinkWrapper) return <>{children}</>;

            let src = "";
            switch (key) {
              case "email": {
                src = `mailto:${value}`;
                break;
              }
              case "phone": {
                src = `tel:${value.replace(/[^\d+]/g, "")}`;
                break;
              }
              default: {
                src = value.startsWith("http") ? value : `https://${value}`;
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
              key={key}
              style={{
                ...styles.flexRow,
                alignItems: "center",
                gap: spacing["1"],
              }}
            >
              <ResumePDFIcon type={iconType} isPDF={isPDF} />
              <Wrapper>
                <ResumePDFText>{value}</ResumePDFText>
              </Wrapper>
            </View>
          );
        })}
      </View>
      {summary && (
        <ResumePDFText style={{ marginTop: spacing["1"] }}>
          {summary}
        </ResumePDFText>
      )}
    </ResumePDFSection>
  );
};
