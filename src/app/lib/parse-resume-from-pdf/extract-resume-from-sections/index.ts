import type { Resume } from "lib/redux/types";
import type { ResumeSectionToLines } from "lib/parse-resume-from-pdf/types";
import { extractProfile } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-profile";
import { extractEducation } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-education";
import { extractWorkExperience } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-work-experience";
import { extractProject } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-project";
import { extractSkills } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-skills";
import { extractCustomSections } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-custom-sections";

export const extractResumeFromSections = (
  sections: ResumeSectionToLines
): Resume => {
  const { profile } = extractProfile(sections);
  const { educations } = extractEducation(sections);
  const { workExperiences } = extractWorkExperience(sections);
  const { projects } = extractProject(sections);
  const { skills } = extractSkills(sections);
  const { custom, customHeading, customSections } = extractCustomSections(sections);

  return {
    profile,
    educations,
    workExperiences,
    projects,
    skills,
    custom,
    customHeading,
    customSections,
  } as any;
};
