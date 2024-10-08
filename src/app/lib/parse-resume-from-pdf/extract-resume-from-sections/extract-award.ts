import type { ResumeAward } from "lib/redux/types";
import type {
  FeatureSet,
  ResumeSectionToLines,
} from "lib/parse-resume-from-pdf/types";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import {
  DATE_FEATURE_SETS,
  getHasText,
  isBold,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features";
import { divideSectionIntoSubsections } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/subsections";
import { getTextWithHighestFeatureScore } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/feature-scoring-system";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";

export const extractAward = (sections: ResumeSectionToLines) => {
  const awards: ResumeAward[] = [];
  const awardsScores = [];
  const lines = getSectionLinesByKeywords(sections, ["award"]);
  const subsections = divideSectionIntoSubsections(lines);

  for (const subsectionLines of subsections) {
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines) ?? 1;

    const subsectionInfoTextItems = subsectionLines
      .slice(0, descriptionsLineIdx)
      .flat();
    const [date, dateScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      DATE_FEATURE_SETS
    );
    const AWARD_FEATURE_SET: FeatureSet[] = [
      [isBold, 2],
      [getHasText(date), -4],
    ];
    const [award, awardScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      AWARD_FEATURE_SET,
      false
    );

    const descriptionsLines = subsectionLines.slice(descriptionsLineIdx);
    const descriptions = getBulletPointsFromLines(descriptionsLines);

    awards.push({ award, date, descriptions });
    awardsScores.push({
      awardScores,
      dateScores,
    });
  }
  return { awards, awardsScores };
};
