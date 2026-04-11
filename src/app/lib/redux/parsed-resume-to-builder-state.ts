import { deepClone } from "lib/deep-clone";
import { deepMerge } from "lib/deep-merge";
import {
  getHasUsedAppBefore,
  loadStateFromLocalStorage,
  saveStateToLocalStorage,
} from "lib/redux/local-storage";
import { initialResumeState } from "lib/redux/resumeSlice";
import {
  type Settings,
  type ShowForm,
  initialSettings,
} from "lib/redux/settingsSlice";
import type { RootState } from "lib/redux/store";
import type {
  Resume,
  ResumeEducation,
  ResumeProject,
  ResumeWorkExperience,
} from "lib/redux/types";

type ParsedResumeImportOptions = {
  enableSmartLayout?: boolean;
};

const hasText = (value: string) => value.trim().length > 0;

const hasWorkExperienceContent = (item: ResumeWorkExperience) =>
  hasText(item.company) ||
  hasText(item.jobTitle) ||
  hasText(item.date) ||
  item.descriptions.some((description) => hasText(description));

const hasEducationContent = (item: ResumeEducation) =>
  hasText(item.school) ||
  hasText(item.degree) ||
  hasText(item.gpa) ||
  hasText(item.date) ||
  item.descriptions.some((description) => hasText(description));

const hasProjectContent = (item: ResumeProject) =>
  hasText(item.project) ||
  hasText(item.date) ||
  hasText(item.url) ||
  item.descriptions.some((description) => hasText(description));

const getSectionToFormToShow = (resume: Resume): Record<ShowForm, boolean> => ({
  workExperiences: resume.workExperiences.some(hasWorkExperienceContent),
  educations: resume.educations.some(hasEducationContent),
  projects: resume.projects.some(hasProjectContent),
  skills:
    resume.skills.descriptions.some((description) => hasText(description)) ||
    resume.skills.featuredSkills.some((item) => hasText(item.skill)),
  custom: resume.custom.descriptions.some((description) => hasText(description)),
});

const getReorderedForms = (
  formsOrder: ShowForm[],
  sectionToFormToShow: Record<ShowForm, boolean>
) => {
  const formsWithContent = formsOrder.filter(
    (form) => sectionToFormToShow[form]
  );
  const formsWithoutContent = formsOrder.filter(
    (form) => !sectionToFormToShow[form]
  );

  return [...formsWithContent, ...formsWithoutContent];
};

export const getBuilderStateFromParsedResume = (
  parsedResume: Resume,
  { enableSmartLayout = getHasUsedAppBefore() }: ParsedResumeImportOptions = {}
): Pick<RootState, "resume" | "settings"> => {
  const resume = deepMerge(initialResumeState, parsedResume) as Resume;
  const settings = deepClone(initialSettings) as Settings;

  if (resume.custom.sectionName && resume.custom.sectionName !== "CUSTOM SECTION") {
    settings.formToHeading.custom = resume.custom.sectionName;
  }

  if (enableSmartLayout) {
    const sectionToFormToShow = getSectionToFormToShow(resume);
    const sections = Object.keys(settings.formToShow) as ShowForm[];
    const hasAnySectionContent = sections.some(
      (section) => sectionToFormToShow[section]
    );

    if (hasAnySectionContent) {
      for (const section of sections) {
        settings.formToShow[section] = sectionToFormToShow[section];
      }
      settings.formsOrder = getReorderedForms(
        settings.formsOrder,
        sectionToFormToShow
      );
    }
  }

  return { resume, settings };
};

export const saveParsedResumeToBuilderState = (
  parsedResume: Resume,
  options?: ParsedResumeImportOptions
) => {
  const nextState = getBuilderStateFromParsedResume(parsedResume, options);
  saveStateToLocalStorage(nextState);
  const savedState = loadStateFromLocalStorage();
  if (!savedState?.resume) {
    throw new Error("Unable to save parsed data to local storage.");
  }
  return nextState;
};