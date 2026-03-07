import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
  ResumeFeaturedSkill,
  ResumePDFText,
} from "components/Resume/ResumePDF/common";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import type { ResumeSkills } from "lib/redux/types";

export const ResumePDFSkills = ({
  heading,
  skills,
  themeColor,
  showBulletPoints,
  skillsDisplayMode = "bullet",
}: {
  heading: string;
  skills: ResumeSkills;
  themeColor: string;
  showBulletPoints: boolean;
  skillsDisplayMode?: "bullet" | "comma";
}) => {
  const { descriptions, featuredSkills } = skills;
  const featuredSkillsWithText = featuredSkills.filter((item) => item.skill);
  const featuredSkillsPair = [
    [featuredSkillsWithText[0], featuredSkillsWithText[3]],
    [featuredSkillsWithText[1], featuredSkillsWithText[4]],
    [featuredSkillsWithText[2], featuredSkillsWithText[5]],
  ];

  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      {featuredSkillsWithText.length > 0 && (
        <View style={{ ...styles.flexRowBetween, marginTop: spacing["0.5"] }}>
          {featuredSkillsPair.map((pair, idx) => (
            <View
              key={idx}
              style={{
                ...styles.flexCol,
              }}
            >
              {pair.map((featuredSkill, idx) => {
                if (!featuredSkill) return null;
                return (
                  <ResumeFeaturedSkill
                    key={idx}
                    skill={featuredSkill.skill}
                    rating={featuredSkill.rating}
                    themeColor={themeColor}
                    style={{
                      justifyContent: "flex-end",
                    }}
                  />
                );
              })}
            </View>
          ))}
        </View>
      )}
      <View
        style={
          skillsDisplayMode === "comma"
            ? { flexDirection: "row", flexWrap: "wrap", gap: spacing["1.5"], marginTop: spacing["0.5"] }
            : { ...styles.flexCol }
        }
      >
        {skillsDisplayMode === "comma" ? (
          descriptions.map((skill, idx) => (
            <View
              key={idx}
              style={{
                border: `1pt solid ${themeColor}`,
                borderRadius: "3pt",
                paddingTop: "2pt",
                paddingBottom: "2pt",
                paddingLeft: spacing["2"],
                paddingRight: spacing["2"],
                backgroundColor: themeColor + "20", // 20 = ~12% opacity hex
              }}
            >
              <ResumePDFText style={{ lineHeight: "1.3" }}>
                {skill}
              </ResumePDFText>
            </View>
          ))
        ) : (
          <ResumePDFBulletList
            items={descriptions}
            showBulletPoints={showBulletPoints}
          />
        )}
      </View>
    </ResumePDFSection>
  );
};
