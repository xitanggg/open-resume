"use client";
import { useState, useMemo } from "react";
import { ResumeIFrame } from "components/Resume/ResumeIFrame";
import { ResumePDF } from "components/Resume/ResumePDF";
import {
  ResumeControlBar,
  ResumeControlBarBorder,
} from "components/Resume/ResumeControlBar";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { useAppSelector } from "lib/redux/hooks";
import { selectResume } from "lib/redux/resumeSlice";
import { selectSettings } from "lib/redux/settingsSlice";
import { DEBUG_RESUME_PDF_FLAG } from "lib/constants";

const Resume = () => {
  const [scale, setScale] = useState(0.8);
  const resume = useAppSelector(selectResume);
  const settings = useAppSelector(selectSettings);
  const document = useMemo(
    () => <ResumePDF resume={resume} settings={settings} isPDF={true} />,
    [resume, settings]
  );

  return (
    <div className="relative flex justify-center md:justify-start">
      <FlexboxSpacer maxWidth={50} className="hidden md:block" />
      <div className="relative">
        <section className="h-[calc(100vh-var(--top-nav-bar-height)-var(--resume-control-bar-height))] overflow-hidden md:p-[var(--resume-padding)]">
          <ResumeIFrame
            documentSize={settings.documentSize}
            scale={scale}
            enablePDFViewer={DEBUG_RESUME_PDF_FLAG}
          >
            <ResumePDF
              resume={resume}
              settings={settings}
              isPDF={DEBUG_RESUME_PDF_FLAG}
            />
          </ResumeIFrame>
        </section>
        <ResumeControlBar
          scale={scale}
          setScale={setScale}
          documentSize={settings.documentSize}
          document={document}
          fileName={resume.profile.name + " - Resume"}
        />
      </div>
      <ResumeControlBarBorder />
    </div>
  );
};

export default Resume;
