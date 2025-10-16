import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFText,
} from "components/Resume/ResumePDF/common";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import type { ResumeWorkExperience } from "lib/redux/types";

const parseDescriptionLine = (line: string) => {
  // Count leading spaces/tabs for indentation (tab = 2 spaces)
  const leadingWhitespace = line.match(/^[\s\t]*/)?.[0] || '';
  let indentLevel = 0;
  for (const char of leadingWhitespace) {
    if (char === '\t') {
      indentLevel += 2;
    } else if (char === ' ') {
      indentLevel += 1;
    }
  }
  const trimmedLine = line.trimStart();

  // Check if line starts with bullet point
  if (trimmedLine.startsWith('- ')) {
    return {
      type: 'bullet' as const,
      text: trimmedLine.substring(2),
      indent: indentLevel
    };
  }

  // Regular text (including [brackets])
  return { type: 'text' as const, text: trimmedLine, indent: indentLevel };
};

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
              <ResumePDFText bold={true}>{company}</ResumePDFText>
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
              {descriptions.map((line, lineIdx) => {
                if (!line.trim()) return null; // Skip empty lines

                const parsed = parseDescriptionLine(line);
                const indentPadding = `${parsed.indent * 6}pt`;

                if (parsed.type === 'bullet') {
                  return (
                    <View
                      key={lineIdx}
                      style={{
                        ...styles.flexRow,
                        marginTop: lineIdx > 0 ? spacing["0.5"] : "0",
                        paddingLeft: indentPadding
                      }}
                    >
                      <ResumePDFText
                        style={{
                          paddingLeft: spacing["2"],
                          paddingRight: spacing["2"],
                          lineHeight: "1.3",
                        }}
                        bold={true}
                      >
                        {"•"}
                      </ResumePDFText>
                      <ResumePDFText
                        style={{ lineHeight: "1.3", flexGrow: 1, flexBasis: 0 }}
                      >
                        {parsed.text}
                      </ResumePDFText>
                    </View>
                  );
                }

                // Regular text (including [brackets])
                return (
                  <View
                    key={lineIdx}
                    style={{
                      marginTop: lineIdx > 0 ? spacing["0.5"] : "0",
                      paddingLeft: indentPadding
                    }}
                  >
                    <ResumePDFText style={{ lineHeight: "1.3" }}>
                      {parsed.text}
                    </ResumePDFText>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </ResumePDFSection>
  );
};
