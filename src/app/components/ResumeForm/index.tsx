"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAppSelector,
  useSaveStateToLocalStorageOnChange,
  useSetInitialStore,
} from "lib/redux/hooks";
import { ShowForm, selectFormsOrder } from "lib/redux/settingsSlice";
import { ProfileForm } from "components/ResumeForm/ProfileForm";
import { WorkExperiencesForm } from "components/ResumeForm/WorkExperiencesForm";
import { EducationsForm } from "components/ResumeForm/EducationsForm";
import { ProjectsForm } from "components/ResumeForm/ProjectsForm";
import { SkillsForm } from "components/ResumeForm/SkillsForm";
import { ThemeForm } from "components/ResumeForm/ThemeForm";
import { CustomForm } from "components/ResumeForm/CustomForm";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { cx } from "lib/cx";

const formTypeToComponent: { [type in ShowForm]: () => JSX.Element } = {
  workExperiences: WorkExperiencesForm,
  educations: EducationsForm,
  projects: ProjectsForm,
  skills: SkillsForm,
  custom: CustomForm,
};

const formLabels: { [type in ShowForm | 'profile' | 'theme']: string } = {
  profile: "Profile",
  workExperiences: "Work Experience",
  educations: "Education",
  projects: "Projects",
  skills: "Skills",
  custom: "Custom Sections",
  theme: "Theme",
};

const formIcons: { [type in ShowForm | 'profile' | 'theme']: JSX.Element } = {
  profile: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  workExperiences: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  educations: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  projects: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  skills: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  custom: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>,
  theme: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>,
};

export const ResumeForm = () => {
  useSetInitialStore();
  useSaveStateToLocalStorageOnChange();

  const formsOrder = useAppSelector(selectFormsOrder);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [isHover, setIsHover] = useState(false);

  const allForms = ['profile', ...formsOrder, 'theme'];

  const handleNext = () => {
    if (currentFormIndex < allForms.length - 1) {
      setCurrentFormIndex(prevIndex => prevIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentFormIndex > 0) {
      setCurrentFormIndex(prevIndex => prevIndex - 1);
    }
  };

  const renderForm = (formType: string) => {
    switch (formType) {
      case 'profile':
        return <ProfileForm />;
      case 'theme':
        return <ThemeForm />;
      default:
        const FormComponent = formTypeToComponent[formType as ShowForm];
        return FormComponent ? <FormComponent /> : null;
    }
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
      <div className="relative flex max-w-2xl flex-col w-full">
        <section className="flex flex-col gap-8 p-[var(--resume-padding)]">
          <div className="flex justify-between items-center mb-6">
            {allForms.map((form, index) => (
              <button
                key={form}
                className="text-xs transition-colors duration-300 flex items-center"
                onClick={() => setCurrentFormIndex(index)}
              >
                {index === currentFormIndex ? (
                  <span className="text-black">
                    {formIcons[form as keyof typeof formIcons]}
                  </span>
                ) : (
                  <span className="text-gray-400 hover:text-gray-600">
                    <span className="hidden md:inline">
                      {formLabels[form as keyof typeof formLabels]}
                    </span>
                    <span className="md:hidden">
                      {formIcons[form as keyof typeof formIcons]}
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentFormIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {renderForm(allForms[currentFormIndex])}
            </motion.div>
          </AnimatePresence>
        </section>

        <div className="fixed top-1/2 -translate-y-1/2 w-full max-w-2xl">
          <button
            className={cx(
              "absolute -left-6 bg-black text-white rounded-full p-2 transition-all duration-200 hover:bg-gray-800",
              currentFormIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
            )}
            onClick={handleBack}
            disabled={currentFormIndex === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button
            className={cx(
              "absolute -right-6 bg-black text-white rounded-full p-2 transition-all duration-200 hover:bg-gray-800",
              currentFormIndex === allForms.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
            )}
            onClick={handleNext}
            disabled={currentFormIndex === allForms.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
      <FlexboxSpacer maxWidth={50} className="hidden md:block" />
    </div>
  );
};

