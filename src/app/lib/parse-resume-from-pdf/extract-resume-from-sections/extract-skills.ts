import type { FeaturedSkill, ResumeSkills } from "lib/redux/types";
import type { ResumeSectionToLines } from "lib/parse-resume-from-pdf/types";
import { deepClone } from "lib/deep-clone";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import { initialFeaturedSkills } from "lib/redux/resumeSlice";
import {
  getBulletPointsFromLines,
  getFirstBulletPointLineIdx,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";

export const extractSkills = (sections: ResumeSectionToLines) => {
  const lines = getSectionLinesByKeywords(sections, ["skill"]);
  const descriptions = getBulletPointsFromLines(lines);

  const featuredSkills = deepClone(initialFeaturedSkills) as FeaturedSkill[];
  const firstBulletPointLineIndex = getFirstBulletPointLineIdx(lines);
  if (
    firstBulletPointLineIndex !== undefined &&
    firstBulletPointLineIndex !== 0
  ) {
    const featuredSkillsLines = lines.slice(0, firstBulletPointLineIndex);
    const featuredSkillsTextItems = featuredSkillsLines
      .flat()
      .filter((item) => item.text.trim())
      .slice(0, 6);
    for (let i = 0; i < featuredSkillsTextItems.length; i++) {
      featuredSkills[i].skill = featuredSkillsTextItems[i].text;
    }
  }

  const skills: ResumeSkills = {
    featuredSkills,
    descriptions,
  };

  return { skills };
};
