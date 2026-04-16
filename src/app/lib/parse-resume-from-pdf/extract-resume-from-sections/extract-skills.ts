import type { ResumeSkills } from "lib/redux/types";
import type { ResumeSectionToLines } from "lib/parse-resume-from-pdf/types";
import { deepClone } from "lib/deep-clone";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import { initialFeaturedSkills } from "lib/redux/resumeSlice";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";

export const extractSkills = (sections: ResumeSectionToLines) => {
  const lines = getSectionLinesByKeywords(sections, ["skill"]);
  const descriptionsLineIdx = getDescriptionsLineIdx(lines) ?? 0;
  const descriptionsLines = lines.slice(descriptionsLineIdx);
  let descriptions = getBulletPointsFromLines(descriptionsLines);

  const hasComma = descriptions.some((desc) => desc.includes(","));
  const isLikelyCommaSeparatedList = hasComma;

  if (isLikelyCommaSeparatedList) {
    descriptions = descriptions
      .map((desc) => desc.replace(/(?=https?:\/\/)/g, ", ").split(","))
      .flat()
      .map((text) => text.trim())
      .filter(Boolean)
      .filter((text) => !text.match(/^https?:\/\//) && !text.match(/^www\./));
  }

  const featuredSkills = deepClone(initialFeaturedSkills);
  if (descriptionsLineIdx !== 0) {
    const featuredSkillsLines = lines.slice(0, descriptionsLineIdx);
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
