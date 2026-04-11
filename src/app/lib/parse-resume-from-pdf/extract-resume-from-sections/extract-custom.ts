import type { ResumeSectionToLines } from "lib/parse-resume-from-pdf/types";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";

const DEFAULT_SECTION_NAMES = [
  "profile",
  "summary",
  "objective",
  "work",
  "experience",
  "employment",
  "history",
  "job",
  "education",
  "course",
  "project",
  "skill",
];

const CUSTOM_SECTION_NAME_HINTS = [
  "custom",
  "certification",
  "license",
  "award",
  "honor",
  "publication",
  "leadership",
  "activity",
  "volunteer",
  "language",
  "interest",
];

const hasAnyKeyword = (text: string, keywords: string[]) =>
  keywords.some((keyword) => text.includes(keyword));

export const extractCustom = (sections: ResumeSectionToLines) => {
  const descriptions: string[] = [];

  let extractedSectionName = "";

  for (const sectionName in sections) {
    const normalizedSectionName = sectionName.toLowerCase();
    const isStandardSection = hasAnyKeyword(
      normalizedSectionName,
      DEFAULT_SECTION_NAMES
    );
    const isCustomSection = hasAnyKeyword(
      normalizedSectionName,
      CUSTOM_SECTION_NAME_HINTS
    );

    if (isStandardSection && !isCustomSection) continue;
    
    if (!extractedSectionName) {
      extractedSectionName = sectionName;
    }

    const lines = sections[sectionName] ?? [];
    if (lines.length === 0) continue;

    const descriptionsStartLine = getDescriptionsLineIdx(lines) ?? 0;
    const sectionDescriptions = getBulletPointsFromLines(
      lines.slice(descriptionsStartLine)
    ).map((text) => text.trim());

    const hasComma = sectionDescriptions.some((desc) => desc.includes(","));    
    const isLikelyCommaSeparatedList = hasComma;

    let finalDescriptions = sectionDescriptions;
    if (isLikelyCommaSeparatedList) {
      finalDescriptions = sectionDescriptions
        .map((desc) => desc.replace(/(?=https?:\/\/)/g, ", ").split(","))
        .flat()
        .map((text) => text.trim())
        .filter(Boolean)
        .filter((text) => !text.match(/^https?:\/\//) && !text.match(/^www\./));
    }

    for (const description of finalDescriptions) {
      if (description) descriptions.push(description);
    }
  }

  return { custom: { descriptions, sectionName: extractedSectionName || "CUSTOM SECTION" } };
};
