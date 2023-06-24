import type { Resume } from "lib/redux/types";
import type { ResumeSectionToLines } from "lib/parse-resume-from-pdf/types";
import { extractProfile } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-profile";
import { extractEducation } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-education";
import { extractWorkExperience } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-work-experience";
import { extractProject } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-project";
import { extractSkills } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-skills";

/**
 * Step 4. Extract resume from sections.
 *
 * This is the core of the resume parser to resume information from the sections.
 *
 * The gist of the extraction engine is a feature scoring system. Each resume attribute
 * to be extracted has a custom feature sets, where each feature set consists of a
 * feature matching function and a feature matching score if matched (feature matching
 * score can be a positive or negative number). To compute the final feature score of
 * a text item for a particular resume attribute, it would run the text item through
 * all its feature sets and sum up the matching feature scores. This process is carried
 * out for all text items within the section, and the text item with the highest computed
 * feature score is identified as the extracted resume attribute.
 */
export const extractResumeFromSections = (
  sections: ResumeSectionToLines
): Resume => {
  const { profile } = extractProfile(sections);
  const { educations } = extractEducation(sections);
  const { workExperiences } = extractWorkExperience(sections);
  const { projects } = extractProject(sections);
  const { skills } = extractSkills(sections);

  return {
    profile,
    educations,
    workExperiences,
    projects,
    skills,
    custom: {
      descriptions: [],
    },
  };
};
