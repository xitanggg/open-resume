import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
  ResumeFeaturedSkill,
} from "components/Resume/ResumePDF/common";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import type { ResumeSkills } from "lib/redux/types";

export const ResumePDFSkills = ({
  heading,
  skills,
  themeColor,
  showBulletPoints,
}: {
  heading: string;
  skills: ResumeSkills;
  themeColor: string;
  showBulletPoints: boolean;
}) => {
  const { descriptions, featuredSkills } = skills;
  const featuredSkillsWithText = featuredSkills.filter((item) => item.skill);

  // 1. Split featuredSkillsWithText into rows of 3 for grid layout
  const columnsPerRow = 3;
  const featuredSkillsRows = [];
  for (let i = 0; i < featuredSkillsWithText.length; i += columnsPerRow) {
    featuredSkillsRows.push(featuredSkillsWithText.slice(i, i + columnsPerRow));
  }

  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      {/* 2. Render featured skills in a grid: each skill gets its own column, up to 3 per row */}
      {featuredSkillsWithText.length > 0 && (
        <View style={{ display: "flex", flexDirection: "column", marginTop: spacing["0.5"] }}>
          {featuredSkillsRows.map((row, rowIdx) => (
            // 4. Add vertical spacing between rows
            <View key={rowIdx} style={{ display: "flex", flexDirection: "row", alignItems: "stretch", width: "100%", marginBottom: spacing["2"] }}>
              {row.map((featuredSkill, colIdx) => (
                // 2. Each skill in its own column, columns are equal width and height
                <View
                  key={colIdx}
                  style={{
                    ...styles.flexCol,
                    flexGrow: 1,
                    flexBasis: 0,
                    maxWidth: `${100 / columnsPerRow}%`,
                    paddingRight: colIdx < columnsPerRow - 1 ? spacing["3"] : 0,
                    justifyContent: "flex-start",
                    height: "100%",
                  }}
                >
                  <ResumeFeaturedSkill
                    skill={featuredSkill.skill}
                    rating={featuredSkill.rating}
                    themeColor={themeColor}
                    style={{ justifyContent: "flex-end" }}
                  />
                </View>
              ))}
              {/* 3. Fill empty columns if less than 3 in this row for alignment */}
              {row.length < columnsPerRow &&
                Array.from({ length: columnsPerRow - row.length }).map((_, i) => (
                  <View
                    key={`empty-${i}`}
                    style={{ flexGrow: 1, flexBasis: 0, maxWidth: `${100 / columnsPerRow}%`, paddingRight: i < columnsPerRow - row.length - 1 ? spacing["3"] : 0 }}
                  />
                ))}
            </View>
          ))}
        </View>
      )}
      {/* Render the rest of the skills as a bullet list below the featured skills grid */}
      <View style={{ ...styles.flexCol }}>
        <ResumePDFBulletList
          items={descriptions}
          showBulletPoints={showBulletPoints}
        />
      </View>
    </ResumePDFSection>
  );
};
