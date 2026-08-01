import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "lib/redux/store";
import type {
  FeaturedSkill,
  Resume,
  ResumeCustomSection,
  ResumeEducation,
  ResumeProfile,
  ResumeProject,
  ResumeSkills,
  ResumeWorkExperience,
} from "lib/redux/types";
import type { ShowForm } from "lib/redux/settingsSlice";

export const initialProfile: ResumeProfile = {
  name: "",
  summary: "",
  email: "",
  phone: "",
  location: "",
  url: "",
};

export const initialWorkExperience: ResumeWorkExperience = {
  company: "",
  jobTitle: "",
  date: "",
  descriptions: [],
};

export const initialEducation: ResumeEducation = {
  school: "",
  degree: "",
  gpa: "",
  date: "",
  descriptions: [],
};

export const initialProject: ResumeProject = {
  project: "",
  date: "",
  descriptions: [],
};

export const initialFeaturedSkill: FeaturedSkill = { skill: "", rating: 4 };
export const initialFeaturedSkills: FeaturedSkill[] = Array(6).fill({
  ...initialFeaturedSkill,
});
export const initialSkills: ResumeSkills = {
  featuredSkills: initialFeaturedSkills,
  descriptions: [],
};

export const initialCustom = {
  descriptions: [],
};

export const initialResumeState: Resume = {
  profile: initialProfile,
  workExperiences: [initialWorkExperience],
  educations: [initialEducation],
  projects: [initialProject],
  skills: initialSkills,
  custom: initialCustom,
  customSections: [],
};

// Keep the field & value type in sync with CreateHandleChangeArgsWithDescriptions (components\ResumeForm\types.ts)
export type CreateChangeActionWithDescriptions<T> = {
  idx: number;
} & (
  | {
      field: Exclude<keyof T, "descriptions">;
      value: string;
    }
  | { field: "descriptions"; value: string[] }
);

export const resumeSlice = createSlice({
  name: "resume",
  initialState: initialResumeState,
  reducers: {
    changeProfile: (
      draft,
      action: PayloadAction<{ field: keyof ResumeProfile; value: string }>
    ) => {
      const { field, value } = action.payload;
      draft.profile[field] = value;
    },
    changeWorkExperiences: (
      draft,
      action: PayloadAction<
        CreateChangeActionWithDescriptions<ResumeWorkExperience>
      >
    ) => {
      const { idx, field, value } = action.payload;
      const workExperience = draft.workExperiences[idx];
      workExperience[field] = value as any;
    },
    changeEducations: (
      draft,
      action: PayloadAction<CreateChangeActionWithDescriptions<ResumeEducation>>
    ) => {
      const { idx, field, value } = action.payload;
      const education = draft.educations[idx];
      education[field] = value as any;
    },
    changeProjects: (
      draft,
      action: PayloadAction<CreateChangeActionWithDescriptions<ResumeProject>>
    ) => {
      const { idx, field, value } = action.payload;
      const project = draft.projects[idx];
      project[field] = value as any;
    },
    changeSkills: (
      draft,
      action: PayloadAction<
        | { field: "descriptions"; value: string[] }
        | {
            field: "featuredSkills";
            idx: number;
            skill: string;
            rating: number;
          }
      >
    ) => {
      const { field } = action.payload;
      if (field === "descriptions") {
        const { value } = action.payload;
        draft.skills.descriptions = value;
      } else {
        const { idx, skill, rating } = action.payload;
        const featuredSkill = draft.skills.featuredSkills[idx];
        featuredSkill.skill = skill;
        featuredSkill.rating = rating;
      }
    },
    changeCustom: (
      draft,
      action: PayloadAction<{ field: "descriptions"; value: string[] }>
    ) => {
      const { value } = action.payload;
      draft.custom.descriptions = value;
    },
    changeCustomSection: (
      draft,
      action: PayloadAction<{
        sectionId: string;
        field: "descriptions";
        value: string[];
      }>
    ) => {
      const { sectionId, value } = action.payload;
      if (sectionId === "custom") {
        if (!draft.custom) draft.custom = { descriptions: [] };
        draft.custom.descriptions = value;
        return;
      }
      if (!draft.customSections) draft.customSections = [];
      const section = draft.customSections.find((s) => s.id === sectionId);
      if (section) {
        section.descriptions = value;
      } else {
        draft.customSections.push({ id: sectionId, descriptions: value });
      }
    },
    addCustomSectionInResume: (
      draft,
      action: PayloadAction<{ sectionId: string }>
    ) => {
      const { sectionId } = action.payload;
      if (!draft.customSections) draft.customSections = [];
      draft.customSections.push({ id: sectionId, descriptions: [] });
    },
    deleteCustomSectionInResume: (
      draft,
      action: PayloadAction<{ sectionId: string }>
    ) => {
      const { sectionId } = action.payload;
      if (!draft.customSections) {
        draft.customSections = [];
        return;
      }
      draft.customSections = draft.customSections.filter(
        (s) => s.id !== sectionId
      );
    },
    addSectionInForm: (draft, action: PayloadAction<{ form: ShowForm }>) => {
      const { form } = action.payload;
      switch (form) {
        case "workExperiences": {
          draft.workExperiences.push(structuredClone(initialWorkExperience));
          return draft;
        }
        case "educations": {
          draft.educations.push(structuredClone(initialEducation));
          return draft;
        }
        case "projects": {
          draft.projects.push(structuredClone(initialProject));
          return draft;
        }
      }
    },
    moveSectionInForm: (
      draft,
      action: PayloadAction<{
        form: ShowForm;
        idx: number;
        direction: "up" | "down";
      }>
    ) => {
      const { form, idx, direction } = action.payload;
      if (form !== "skills" && form !== "custom") {
        if (
          (idx === 0 && direction === "up") ||
          (idx === draft[form as "workExperiences" | "educations" | "projects"].length - 1 && direction === "down")
        ) {
          return draft;
        }

        const section = draft[form as "workExperiences" | "educations" | "projects"][idx];
        if (direction === "up") {
          draft[form as "workExperiences" | "educations" | "projects"][idx] = draft[form as "workExperiences" | "educations" | "projects"][idx - 1];
          draft[form as "workExperiences" | "educations" | "projects"][idx - 1] = section;
        } else {
          draft[form as "workExperiences" | "educations" | "projects"][idx] = draft[form as "workExperiences" | "educations" | "projects"][idx + 1];
          draft[form as "workExperiences" | "educations" | "projects"][idx + 1] = section;
        }
      }
    },
    deleteSectionInFormByIdx: (
      draft,
      action: PayloadAction<{ form: ShowForm; idx: number }>
    ) => {
      const { form, idx } = action.payload;
      if (form !== "skills" && form !== "custom") {
        (draft[form as "workExperiences" | "educations" | "projects"] as any[]).splice(idx, 1);
      }
    },
    setResume: (draft, action: PayloadAction<Resume>) => {
      const resume = action.payload;
      if (!resume.customSections) {
        resume.customSections = [];
      }
      if (!resume.custom) {
        resume.custom = { descriptions: [] };
      }
      return resume;
    },
  },
});

export const {
  changeProfile,
  changeWorkExperiences,
  changeEducations,
  changeProjects,
  changeSkills,
  changeCustom,
  changeCustomSection,
  addCustomSectionInResume,
  deleteCustomSectionInResume,
  addSectionInForm,
  moveSectionInForm,
  deleteSectionInFormByIdx,
  setResume,
} = resumeSlice.actions;

export const selectResume = (state: RootState) => state.resume;
export const selectProfile = (state: RootState) => state.resume.profile;
export const selectWorkExperiences = (state: RootState) =>
  state.resume.workExperiences;
export const selectEducations = (state: RootState) => state.resume.educations;
export const selectProjects = (state: RootState) => state.resume.projects;
export const selectSkills = (state: RootState) => state.resume.skills;
export const selectCustom = (state: RootState) => state.resume.custom;
export const selectCustomSections = (state: RootState) =>
  state.resume.customSections ?? [];
export const selectCustomSectionById =
  (sectionId: string) => (state: RootState) => {
    if (sectionId === "custom") return state.resume.custom;
    return state.resume.customSections?.find((s) => s.id === sectionId);
  };

export default resumeSlice.reducer;
