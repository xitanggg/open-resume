import { Text, View, Link } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import { DEBUG_RESUME_PDF_FLAG } from "lib/constants";
import { DEFAULT_FONT_COLOR } from "lib/redux/settingsSlice";

export const ResumePDFSection = ({
  themeColor,
  heading,
  style = {},
  children,
}: {
  themeColor?: string;
  heading?: string;
  style?: Style;
  children: React.ReactNode;
}) => (
  <View
    style={{
      ...styles.flexCol,
      gap: spacing["2"],
      marginTop: spacing["5"],
      ...style,
    }}
  >
    {heading && (
      <View style={{ ...styles.flexRow, alignItems: "center" }}>
        {themeColor && (
          <View
            style={{
              height: "3.75pt",
              width: "30pt",
              backgroundColor: themeColor,
              marginRight: spacing["3.5"],
            }}
            debug={DEBUG_RESUME_PDF_FLAG}
          />
        )}
        <Text
          style={{
            fontWeight: "bold",
            letterSpacing: "0.3pt", // tracking-wide -> 0.025em * 12 pt = 0.3pt
          }}
          debug={DEBUG_RESUME_PDF_FLAG}
        >
          {heading}
        </Text>
      </View>
    )}
    {children}
  </View>
);

export const ResumePDFText = ({
  bold = false,
  themeColor,
  style = {},
  children,
}: {
  bold?: boolean;
  themeColor?: string;
  style?: Style;
  children: React.ReactNode;
}) => {
  return (
    <Text
      style={{
        color: themeColor || DEFAULT_FONT_COLOR,
        fontWeight: bold ? "bold" : "normal",
        ...style,
      }}
      debug={DEBUG_RESUME_PDF_FLAG}
    >
      {children}
    </Text>
  );
};

export const ResumePDFBulletList = ({
  items,
  showBulletPoints = true,
}: {
  items: string[];
  showBulletPoints?: boolean;
}) => {
  // Function to detect and parse category patterns like "Category Name: items..."
  const parseSkillCategory = (item: string) => {
    // Look for pattern: "Word(s):" at the start of the line
    const categoryMatch = item.match(/^([^:]+):\s*(.*)$/);
    
    if (categoryMatch) {
      const [, category, content] = categoryMatch;
      return {
        hasCategory: true,
        category: category.trim(),
        content: content.trim(),
      };
    }
    
    return {
      hasCategory: false,
      category: '',
      content: item,
    };
  };

  return (
    <>
      {items.map((item, idx) => {
        const parsed = parseSkillCategory(item);
        
        return (
          <View style={{ ...styles.flexRow }} key={idx}>
            {showBulletPoints && (
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
            )}
            {/* A breaking change was introduced causing text layout to be wider than node's width
                https://github.com/diegomura/react-pdf/issues/2182. flexGrow & flexBasis fixes it */}
            <View style={{ lineHeight: "1.3", flexGrow: 1, flexBasis: 0, flexDirection: "row", flexWrap: "wrap" }}>
              {parsed.hasCategory ? (
                <>
                  <ResumePDFText bold={true}>
                    {parsed.category}:
                  </ResumePDFText>
                  <ResumePDFText style={{ marginLeft: spacing["1"] }}>
                    {parsed.content}
                  </ResumePDFText>
                </>
              ) : (
                <ResumePDFText>
                  {parsed.content}
                </ResumePDFText>
              )}
            </View>
          </View>
        );
      })}
    </>
  );
};

export const ResumePDFLink = ({
  src,
  isPDF,
  children,
}: {
  src: string;
  isPDF: boolean;
  children: React.ReactNode;
}) => {
  if (isPDF) {
    return (
      <Link src={src} style={{ textDecoration: "none" }}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={src}
      style={{ textDecoration: "none" }}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
};

export const ResumeFeaturedSkill = ({
  skill,
  rating,
  themeColor,
  style = {},
}: {
  skill: string;
  rating: number;
  themeColor: string;
  style?: Style;
}) => {
  const numCircles = 5;

  return (
    <View style={{ ...styles.flexRow, alignItems: "center", ...style }}>
      <ResumePDFText style={{ marginRight: spacing[0.5] }}>
        {skill}
      </ResumePDFText>
      {[...Array(numCircles)].map((_, idx) => (
        <View
          key={idx}
          style={{
            height: "9pt",
            width: "9pt",
            marginLeft: "2.25pt",
            backgroundColor: rating >= idx ? themeColor : "#d9d9d9",
            borderRadius: "100%",
          }}
        />
      ))}
    </View>
  );
};
