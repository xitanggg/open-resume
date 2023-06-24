import type { ResumeSectionToLines } from "lib/parse-resume-from-pdf/types";

/**
 * Return section lines that contain any of the keywords.
 */
export const getSectionLinesByKeywords = (
  sections: ResumeSectionToLines,
  keywords: string[]
) => {
  for (const sectionName in sections) {
    const hasKeyWord = keywords.some((keyword) =>
      sectionName.toLowerCase().includes(keyword)
    );
    if (hasKeyWord) {
      return sections[sectionName];
    }
  }
  return [];
};
