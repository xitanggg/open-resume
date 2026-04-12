import type { ResumeProject } from "lib/redux/types";
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

const URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?/gi;
const matchUrl = (text: string) =>
  text.match(URL_REGEX)?.[0] ?? "";

const PROJECT_SPLIT_REGEX = /\s(?:\||\u2022|\u00B7)\s/;
const PROJECT_DASH_SPLIT_REGEX = /\s[-\u2013\u2014]\s/;
const DESCRIPTION_HINT_REGEX =
  /\b(developed|built|created|implemented|designed|led|optimized|improved|using|with|for|to)\b/i;

const escapeRegex = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const cleanProjectText = (text: string) =>
  text
    .replace(URL_REGEX, " ")
    .replace(/\s+/g, " ")
    .trim();

const looksLikeDescription = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length >= 8 || (words.length >= 5 && DESCRIPTION_HINT_REGEX.test(text));
};

export const sanitizeProjectName = (rawProject: string, date: string) => {
  if (!rawProject) return "";

  let text = cleanProjectText(rawProject)
    .replace(/^projects?\s*[:\-]\s*/i, "")
    .trim();

  if (date) {
    text = text.replace(new RegExp(escapeRegex(date), "gi"), " ");
  }

  if (PROJECT_SPLIT_REGEX.test(text)) {
    text = text.split(PROJECT_SPLIT_REGEX)[0] || text;
  }

  if (PROJECT_DASH_SPLIT_REGEX.test(text)) {
    const [left = "", ...rightParts] = text.split(PROJECT_DASH_SPLIT_REGEX);
    const right = rightParts.join(" ").trim();
    if (right && looksLikeDescription(right)) {
      text = left;
    }
  }

  text = text
    .replace(/\s+/g, " ")
    .replace(/^[\s\-:;,|\u2022\u00B7]+/, "")
    .replace(/[\s\-:;,|\u2022\u00B7]+$/, "")
    .trim();

  return text;
};

export const extractProject = (sections: ResumeSectionToLines) => {
  const projects: ResumeProject[] = [];
  const projectsScores = [];
  const lines = getSectionLinesByKeywords(sections, ["project"]);
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
    const PROJECT_FEATURE_SET: FeatureSet[] = [
      [isBold, 2],
      [getHasText(date), -4],
    ];
    const [project, projectScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      PROJECT_FEATURE_SET,
      false
    );
    const rawProjectFromFirstInfoLine = (subsectionLines[0] ?? [])
      .map((item) => item.text)
      .join(" ");
    const normalizedProjectFromScore = sanitizeProjectName(project, date);
    const normalizedProjectFromFirstInfoLine = sanitizeProjectName(
      rawProjectFromFirstInfoLine,
      date
    );
    const normalizedProject =
      !normalizedProjectFromScore || looksLikeDescription(normalizedProjectFromScore)
        ? normalizedProjectFromFirstInfoLine || normalizedProjectFromScore
        : normalizedProjectFromScore;

    const descriptionsLines = subsectionLines.slice(descriptionsLineIdx);
    const descriptions = getBulletPointsFromLines(descriptionsLines);
    const projectUrl = subsectionLines
      .flat()
      .map((item) => item.text)
      .map((text) => matchUrl(text))
      .find((text) => text && !text.includes("@"));

    projects.push({
      project: normalizedProject,
      date,
      descriptions,
      url: projectUrl || "",
    });
    projectsScores.push({
      projectScores,
      dateScores,
    });
  }
  return { projects, projectsScores };
};
