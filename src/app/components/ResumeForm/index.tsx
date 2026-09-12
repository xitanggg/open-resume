"use client";
import { useState } from "react";
import {
  useAppDispatch,
  useAppSelector,
  useSaveStateToLocalStorageOnChange,
  useSetInitialStore,
} from "lib/redux/hooks";
import { ShowForm, selectFormsOrder, addCustomSectionInSettings } from "lib/redux/settingsSlice";
import { addCustomSectionInResume } from "lib/redux/resumeSlice";
import { ProfileForm } from "components/ResumeForm/ProfileForm";
import { WorkExperiencesForm } from "components/ResumeForm/WorkExperiencesForm";
import { EducationsForm } from "components/ResumeForm/EducationsForm";
import { ProjectsForm } from "components/ResumeForm/ProjectsForm";
import { SkillsForm } from "components/ResumeForm/SkillsForm";
import { ThemeForm } from "components/ResumeForm/ThemeForm";
import { CustomForm } from "components/ResumeForm/CustomForm";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { cx } from "lib/cx";
import { PlusIcon } from "@heroicons/react/24/outline";

const STATIC_FORM_TO_COMPONENT: {
  [type: string]: (() => JSX.Element) | undefined;
} = {
  workExperiences: WorkExperiencesForm,
  educations: EducationsForm,
  projects: ProjectsForm,
  skills: SkillsForm,
};

const getFormComponent = (form: ShowForm): (() => JSX.Element) => {
  if (STATIC_FORM_TO_COMPONENT[form]) {
    return STATIC_FORM_TO_COMPONENT[form]!;
  }
  // Dynamic custom section — form key is the sectionId
  return () => <CustomForm sectionId={form} />;
};

export const ResumeForm = () => {
  useSetInitialStore();
  useSaveStateToLocalStorageOnChange();

  const formsOrder = useAppSelector(selectFormsOrder);
  const [isHover, setIsHover] = useState(false);
  const dispatch = useAppDispatch();

  const handleAddSection = () => {
    const sectionId = `customSection-${Date.now()}`;
    const heading = "NEW SECTION";
    dispatch(addCustomSectionInSettings({ sectionId, heading }));
    dispatch(addCustomSectionInResume({ sectionId }));
  };

  return (
    <div
      className={cx(
        "flex justify-center scrollbar-thin scrollbar-track-gray-100 md:h-[calc(100vh-var(--top-nav-bar-height))] md:justify-end md:overflow-y-scroll",
        isHover ? "scrollbar-thumb-gray-200" : "scrollbar-thumb-gray-100"
      )}
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <section className="flex max-w-2xl flex-col gap-8 p-[var(--resume-padding)]">
        <ProfileForm />
        {formsOrder.map((form) => {
          const Component = getFormComponent(form);
          return <Component key={form} />;
        })}
        {/* Add Section Button */}
        <button
          type="button"
          onClick={handleAddSection}
          className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 bg-white py-3 px-4 text-sm font-semibold text-gray-500 shadow-sm transition-all duration-200 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-600 hover:shadow-md"
        >
          <PlusIcon className="h-5 w-5" aria-hidden="true" />
          Add Section
        </button>
        <ThemeForm />
        <br />
      </section>
      <FlexboxSpacer maxWidth={50} className="hidden md:block" />
    </div>
  );
};
