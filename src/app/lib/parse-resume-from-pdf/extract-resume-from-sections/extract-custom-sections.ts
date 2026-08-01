import type { ResumeCustomSection } from "lib/redux/types";
import type { ResumeSectionToLines } from "lib/parse-resume-from-pdf/types";
import { getBulletPointsFromLines } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";

const MAIN_KEYWORDS = [
  "profile",
  "experience",
  "work",
  "job",
  "employment",
  "education",
  "academic",
  "school",
  "project",
  "skill",
];

export interface ExtractedCustomSectionData {
  custom: { descriptions: string[] };
  customHeading?: string;
  customSections: (ResumeCustomSection & { heading: string })[];
}

export const extractCustomSections = (
  sections: ResumeSectionToLines
): ExtractedCustomSectionData => {
  const customSectionKeys: string[] = [];

  for (const sectionName in sections) {
    if (sectionName.toLowerCase() === "profile") continue;
    const isMainSection = MAIN_KEYWORDS.some((keyword) =>
      sectionName.toLowerCase().includes(keyword)
    );
    if (!isMainSection) {
      customSectionKeys.push(sectionName);
    }
  }

  if (customSectionKeys.length === 0) {
    return {
      custom: { descriptions: [] },
      customSections: [],
    };
  }

  // First custom section goes to `custom`
  const firstKey = customSectionKeys[0];
  const firstLines = sections[firstKey];
  const firstBullets = getBulletPointsFromLines(firstLines);
  const firstDescriptions =
    firstBullets.length > 0
      ? firstBullets
      : firstLines
          .map((line) => line.map((item) => item.text).join(" ").trim())
          .filter(Boolean);

  const custom = { descriptions: firstDescriptions };
  const customHeading = firstKey.toUpperCase();

  // Additional custom sections go to `customSections`
  const customSections: (ResumeCustomSection & { heading: string })[] = [];
  for (let i = 1; i < customSectionKeys.length; i++) {
    const key = customSectionKeys[i];
    const lines = sections[key];
    const bullets = getBulletPointsFromLines(lines);
    const descriptions =
      bullets.length > 0
        ? bullets
        : lines
            .map((line) => line.map((item) => item.text).join(" ").trim())
            .filter(Boolean);

    customSections.push({
      id: `customSection-${Date.now()}-${i}`,
      descriptions,
      heading: key.toUpperCase(),
    });
  }

  return {
    custom,
    customHeading,
    customSections,
  };
};
