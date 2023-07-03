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

export const ResumePDFProfile = ({
  profile,
  themeColor,
  isPDF,
}: {
  profile: ResumeProfile;
  themeColor: string;
  isPDF: boolean;
}) => {
  const { name, email, phone, url, summary, location } = profile;
  const iconProps = { email, phone, location, url };

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
          ...styles.flexRowBetween,
          flexWrap: "wrap",
          marginTop: spacing["0.5"],
        }}
      >
        {Object.entries(iconProps).map(([key, value]) => {
          if (!value) return null;

          let iconType = key as IconType;
          if (key === "url") {
            if (value.includes("github")) {
              iconType = "url_github";
            } else if (value.includes("linkedin")) {
              iconType = "url_linkedin";
            }
          }

          const shouldUseLinkWrapper = ["email", "url", "phone"].includes(key);
          const Wrapper = ({ children }: { children: React.ReactNode }) => {
            if (!shouldUseLinkWrapper) return <>{children}</>;

            let urlSrc = "";

            switch (key) {
              case "email":
                urlSrc = `mailto:${value}`;
                break;

              case "phone":
                urlSrc = `tel:${value.replace(/[^\d+]/g, "")}`;
                break;

              case "url":
                let removalCases = ["http://", "https://"];
                let http_protocol = "https://";

                removalCases.forEach((item) => {
                  if (value.startsWith(item)) {
                    value = value.substring(item.length - 1, value.length - 1);
                    http_protocol = item;
                  }
                });

                urlSrc = `${http_protocol}${value}`;
                break;
            }

            return (
              <ResumePDFLink src={urlSrc} isPDF={isPDF}>
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
    </ResumePDFSection>
  );
};
