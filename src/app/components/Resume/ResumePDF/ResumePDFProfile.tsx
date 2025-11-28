import { View } from "@react-pdf/renderer";
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
  const { name, email, phone, url, summary, location, portfolio, github } = profile;

  // 1. Filter out empty values so we can correctly place separators
  const iconProps = { email, phone, location, url, portfolio, github };
  const activeItems = Object.entries(iconProps).filter(([_, value]) => value);

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
          marginTop: spacing["0.5"],
          alignItems: "center", // Align text and dots vertically
          // Note: We removed 'gap' here to control spacing precisely via the separator margins below
        }}
      >
        {activeItems.map(([key, value], index) => {
          const shouldUseLinkWrapper = ["email", "url", "phone", "portfolio", "github"].includes(key);

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
              }}
            >
              {/* 2. Separator Logic: Add dot before item if it is NOT the first item */}
              {index > 0 && (
                <View style={{ marginLeft: spacing["2"], marginRight: spacing["2"] }}>
                  <ResumePDFText>•</ResumePDFText>
                </View>
              )}

              {/* 3. Render Value (No Icon) */}
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