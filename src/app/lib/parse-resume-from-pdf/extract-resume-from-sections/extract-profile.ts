import type {
  ResumeSectionToLines,
  TextItem,
  FeatureSet,
} from "lib/parse-resume-from-pdf/types";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import {
  isBold,
  hasNumber,
  hasComma,
  hasLetter,
  hasLetterAndIsAllUpperCase,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features";
import { getTextWithHighestFeatureScore } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/feature-scoring-system";

// Name
export const matchOnlyLetterSpaceOrPeriod = (item: TextItem) =>
  item.text.match(/^[a-zA-Z\s\.]+$/);

// Email
// Simple email regex: xxx@xxx.xxx (xxx = anything not space)
export const matchEmail = (item: TextItem) => item.text.match(/\S+@\S+\.\S+/);
const hasAt = (item: TextItem) => item.text.includes("@");

// Phone
// Simple phone regex that matches (xxx)-xxx-xxxx where () and - are optional, - can also be space
export const matchPhone = (item: TextItem) =>
  item.text.match(/\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
const hasParenthesis = (item: TextItem) => /\([0-9]+\)/.test(item.text);

// Location
// Simple location regex that matches "<City>, <ST>"
export const matchCityAndState = (item: TextItem) =>
  item.text.match(/[A-Z][a-zA-Z\s]+, [A-Z]{2}/);

const LOCATION_SEGMENT_REGEXES = [
  /[A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+)*,\s*[A-Z]{2}\b/,
  /[A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+)*,\s*[A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+)*/,
  /[A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+)+\s+[A-Z]{2}\b/,
] as const;

const CONTACT_SEGMENT_SPLITTER = /[\|\u2022\u00B7]/;
const looksLikeContactInfoNoise = (segment: string) => {
  const lower = segment.toLowerCase();
  return (
    segment.includes("@") ||
    /https?:\/\//i.test(segment) ||
    /www\./i.test(segment) ||
    lower.includes("linkedin.com") ||
    lower.includes("github.com") ||
    /\d{3}/.test(segment)
  );
};

export const matchLocation = (item: TextItem) => {
  const segments = item.text
    .split(CONTACT_SEGMENT_SPLITTER)
    .map((segment) => segment.trim())
    .filter(Boolean);

  for (const segment of segments) {
    if (looksLikeContactInfoNoise(segment)) continue;

    for (const regex of LOCATION_SEGMENT_REGEXES) {
      const match = segment.match(regex);
      if (match) {
        return match;
      }
    }
  }

  for (const regex of LOCATION_SEGMENT_REGEXES) {
    const match = item.text.match(regex);
    if (match) {
      return match;
    }
  }

  return null;
};

// Url
// Better url regex that matches either "http/https://" or "www." or just a domain like "domain.com/path"
export const matchUrl = (item: TextItem) => {
  const match = item.text.match(
    /(?:https?:\/\/)?(?:www\.)?(?!github\.com)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?/i
  );
  if (!match) return null;

  const matchStartIdx = match.index ?? -1;
  if (matchStartIdx > 0 && item.text[matchStartIdx - 1] === "@") {
    return null;
  }

  return match;
};
export const matchGithubUrl = (item: TextItem) =>
  item.text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/\S+/i);
// Match https://xxx.xxx where s is optional
const matchUrlHttpFallback = (item: TextItem) =>
  item.text.match(/https?:\/\/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?/i);
// Match www.xxx.xxx
const matchUrlWwwFallback = (item: TextItem) =>
  item.text.match(/www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?/i);
const hasSlash = (item: TextItem) => item.text.includes("/");

// Summary
const has4OrMoreWords = (item: TextItem) => item.text.split(" ").length >= 4;

/**
 *              Unique Attribute
 * Name         Bold or Has all uppercase letter
 * Email        Has @
 * Phone        Has ()
 * Location     Has ,    (overlap with summary)
 * Url          Has slash
 * Summary      Has 4 or more words
 */

/**
 * Name -> contains only letters/space/period, e.g. Leonardo W. DiCaprio
 *         (it isn't common to include middle initial in resume)
 *      -> is bolded or has all letters as uppercase
 */
const NAME_FEATURE_SETS: FeatureSet[] = [
  [matchOnlyLetterSpaceOrPeriod, 3, true],
  [isBold, 2],
  [hasLetterAndIsAllUpperCase, 2],
  // Match against other unique attributes
  [hasAt, -4], // Email
  [hasNumber, -4], // Phone
  [hasParenthesis, -4], // Phone
  [hasComma, -4], // Location
  [hasSlash, -4], // Url
  [has4OrMoreWords, -2], // Summary
];

// Email -> match email regex xxx@xxx.xxx
const EMAIL_FEATURE_SETS: FeatureSet[] = [
  [matchEmail, 4, true],
  [isBold, -1], // Name
  [hasLetterAndIsAllUpperCase, -1], // Name
  [hasParenthesis, -4], // Phone
  [hasComma, -4], // Location
  [hasSlash, -4], // Url
  [has4OrMoreWords, -4], // Summary
];

// Phone -> match phone regex (xxx)-xxx-xxxx
const PHONE_FEATURE_SETS: FeatureSet[] = [
  [matchPhone, 4, true],
  [hasLetter, -4], // Name, Email, Location, Url, Summary
];

// Location -> match location regex <City>, <ST>
const LOCATION_FEATURE_SETS: FeatureSet[] = [
  [matchLocation, 4, true],
  [matchCityAndState, 4, true],
  [isBold, -1], // Name
  [hasAt, -4], // Email
  [hasParenthesis, -3], // Phone
  [hasSlash, -4], // Url
];

// URL -> match url regex xxx.xxx/xxx
const URL_FEATURE_SETS: FeatureSet[] = [
  [matchUrl, 4, true],
  [matchUrlHttpFallback, 3, true],
  [matchUrlWwwFallback, 3, true],
  [isBold, -1], // Name
  [hasAt, -4], // Email
  [hasParenthesis, -3], // Phone
  [hasComma, -4], // Location
  [has4OrMoreWords, -4], // Summary
];

// Summary -> has 4 or more words
const SUMMARY_FEATURE_SETS: FeatureSet[] = [
  [has4OrMoreWords, 4],
  [isBold, -1], // Name
  [hasAt, -4], // Email
  [hasParenthesis, -3], // Phone
  [matchCityAndState, -4, false], // Location
];

export const extractProfile = (sections: ResumeSectionToLines) => {
  const lines = sections.profile || [];
  const textItems = lines.flat();

  const [name, nameScores] = getTextWithHighestFeatureScore(
    textItems,
    NAME_FEATURE_SETS
  );
  const [email, emailScores] = getTextWithHighestFeatureScore(
    textItems,
    EMAIL_FEATURE_SETS
  );
  const [phone, phoneScores] = getTextWithHighestFeatureScore(
    textItems,
    PHONE_FEATURE_SETS
  );
  const [location, locationScores] = getTextWithHighestFeatureScore(
    textItems,
    LOCATION_FEATURE_SETS
  );
  const [url, urlScores] = getTextWithHighestFeatureScore(
    textItems,
    URL_FEATURE_SETS
  );
  const nonGithubUrlFromTextItems =
    textItems
      .map((item) => item.text.match(/\S+\.[a-z]+\/\S+/)?.[0] || "")
      .find(
        (text) =>
          text &&
          !text.toLowerCase().includes("github.com") &&
          !text.includes("@")
      ) || "";
  const github =
    textItems.find((item) => matchGithubUrl(item))?.text ||
    (url.toLowerCase().includes("github.com") ? url : "");
  const normalizedUrl =
    url.toLowerCase().includes("github.com") && nonGithubUrlFromTextItems
      ? nonGithubUrlFromTextItems
      : url;
  const [summary, summaryScores] = getTextWithHighestFeatureScore(
    textItems,
    SUMMARY_FEATURE_SETS,
    undefined,
    true
  );

  const summaryLines = getSectionLinesByKeywords(sections, ["summary"]);
  const summarySection = summaryLines
    .flat()
    .map((textItem) => textItem.text)
    .join(" ");
  const objectiveLines = getSectionLinesByKeywords(sections, ["objective"]);
  const objectiveSection = objectiveLines
    .flat()
    .map((textItem) => textItem.text)
    .join(" ");

  return {
    profile: {
      name,
      email,
      phone,
      location,
      url: normalizedUrl,
      github,
      // Dedicated section takes higher precedence over profile summary
      summary: summarySection || objectiveSection || summary,
    },
    // For debugging
    profileScores: {
      name: nameScores,
      email: emailScores,
      phone: phoneScores,
      location: locationScores,
      url: urlScores,
      summary: summaryScores,
    },
  };
};
