import { Page, View, Document } from "@react-pdf/renderer";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import { ResumePDFProfile } from "components/Resume/ResumePDF/ResumePDFProfile";
import { ResumePDFWorkExperience } from "components/Resume/ResumePDF/ResumePDFWorkExperience";
import { ResumePDFEducation } from "components/Resume/ResumePDF/ResumePDFEducation";
import { ResumePDFProject } from "components/Resume/ResumePDF/ResumePDFProject";
import { ResumePDFSkills } from "components/Resume/ResumePDF/ResumePDFSkills";
import { ResumePDFCustom } from "components/Resume/ResumePDF/ResumePDFCustom";
import { DEFAULT_FONT_COLOR } from "lib/redux/settingsSlice";
import type { Settings, ShowForm } from "lib/redux/settingsSlice";
import type { Resume, ResumeCustomSection } from "lib/redux/types";
import { SuppressResumePDFErrorMessage } from "components/Resume/ResumePDF/common/SuppressResumePDFErrorMessage";

/**
 * Note: ResumePDF is supposed to be rendered inside PDFViewer. However,
 * PDFViewer is rendered too slow and has noticeable delay as you enter
 * the resume form, so we render it without PDFViewer to make it render
 * instantly. There are 2 drawbacks with this approach:
 * 1. Not everything works out of box if not rendered inside PDFViewer,
 *    e.g. svg doesn't work, so it takes in a isPDF flag that maps react
 *    pdf element to the correct dom element.
 * 2. It throws a lot of errors in console log, e.g. "<VIEW /> is using incorrect
 *    casing. Use PascalCase for React components, or lowercase for HTML elements."
 *    in development, causing a lot of noises. We can possibly workaround this by
 *    mapping every react pdf element to a dom element, but for now, we simply
 *    suppress these messages in <SuppressResumePDFErrorMessage />.
 *    https://github.com/diegomura/react-pdf/issues/239#issuecomment-487255027
 */
export const ResumePDF = ({
  resume,
  settings,
  isPDF = false,
}: {
  resume: Resume;
  settings: Settings;
  isPDF?: boolean;
}) => {
  const { profile, workExperiences, educations, projects, skills, custom, customSections } =
    resume;
  const { name } = profile;
  const {
    fontFamily,
    fontSize,
    documentSize,
    formToHeading,
    formToShow,
    formsOrder,
    showBulletPoints,
  } = settings;
  const themeColor = settings.themeColor || DEFAULT_FONT_COLOR;

  const showFormsOrder = formsOrder.filter((form) => formToShow[form]);

  const getFormComponent = (form: ShowForm): (() => JSX.Element) => {
    switch (form) {
      case "workExperiences":
        return () => (
          <ResumePDFWorkExperience
            heading={formToHeading["workExperiences"]}
            workExperiences={workExperiences}
            themeColor={themeColor}
          />
        );
      case "educations":
        return () => (
          <ResumePDFEducation
            heading={formToHeading["educations"]}
            educations={educations}
            themeColor={themeColor}
            showBulletPoints={showBulletPoints["educations"]}
          />
        );
      case "projects":
        return () => (
          <ResumePDFProject
            heading={formToHeading["projects"]}
            projects={projects}
            themeColor={themeColor}
          />
        );
      case "skills":
        return () => (
          <ResumePDFSkills
            heading={formToHeading["skills"]}
            skills={skills}
            themeColor={themeColor}
            showBulletPoints={showBulletPoints["skills"]}
          />
        );
      case "custom":
        return () => (
          <ResumePDFCustom
            heading={formToHeading["custom"] ?? "CUSTOM SECTION"}
            custom={custom}
            themeColor={themeColor}
            showBulletPoints={showBulletPoints["custom"] ?? true}
          />
        );
      default: {
        // Dynamic custom sections: look up by sectionId
        const section: ResumeCustomSection | undefined = customSections?.find(
          (s) => s.id === form
        );
        if (!section) return () => <></>;
        const customData = { descriptions: section.descriptions };
        return () => (
          <ResumePDFCustom
            heading={formToHeading[form] ?? "CUSTOM SECTION"}
            custom={customData}
            themeColor={themeColor}
            showBulletPoints={showBulletPoints[form] ?? true}
          />
        );
      }
    }
  };

  return (
    <>
      <Document title={`${name} Resume`} author={name} producer={"OpenResume"}>
        <Page
          size={documentSize === "A4" ? "A4" : "LETTER"}
          style={{
            ...styles.flexCol,
            color: DEFAULT_FONT_COLOR,
            fontFamily,
            fontSize: fontSize + "pt",
          }}
        >
          {Boolean(settings.themeColor) && (
            <View
              style={{
                width: spacing["full"],
                height: spacing[3.5],
                backgroundColor: themeColor,
              }}
            />
          )}
          <View
            style={{
              ...styles.flexCol,
              padding: `${spacing[0]} ${spacing[20]}`,
            }}
          >
            <ResumePDFProfile
              profile={profile}
              themeColor={themeColor}
              isPDF={isPDF}
            />
            {showFormsOrder.map((form) => {
              const Component = getFormComponent(form);
              return <Component key={form} />;
            })}
          </View>
        </Page>
      </Document>
      <SuppressResumePDFErrorMessage />
    </>
  );
};
