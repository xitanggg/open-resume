"use client";
import { useState } from "react";
import { Form, FormSection } from "components/ResumeForm/Form";
import {
  BulletListTextarea,
  Input,
} from "components/ResumeForm/Form/InputGroup";
import { BulletListIconButton } from "components/ResumeForm/Form/IconButton";
import type { CreateHandleChangeArgsWithDescriptions } from "components/ResumeForm/types";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { changeEducations, selectEducations } from "lib/redux/resumeSlice";
import type { ResumeEducation } from "lib/redux/types";
import {
  changeShowBulletPoints,
  selectShowBulletPoints,
} from "lib/redux/settingsSlice";
import { AIButton } from "components/AI/AIButton";
import { AIPanel } from "components/AI/AIPanel";
import { callAI, parseBulletPoints } from "lib/ai/ai-service";
import { buildUniversalPrompt } from "lib/ai/ai-prompts";
import { selectProfile, selectWorkExperiences, selectSkills } from "lib/redux/resumeSlice";

export const EducationsForm = () => {
  const educations = useAppSelector(selectEducations);
  const profile = useAppSelector(selectProfile);
  const workExperiences = useAppSelector(selectWorkExperiences);
  const skills = useAppSelector(selectSkills);
  const dispatch = useAppDispatch();
  const showDelete = educations.length > 1;
  const form = "educations";
  const showBulletPoints = useAppSelector(selectShowBulletPoints(form));

  // AI state per section
  const [aiStates, setAiStates] = useState<
    Record<number, { content: string; loading: boolean; error: string; open: boolean }>
  >({});

  const getAiState = (idx: number) =>
    aiStates[idx] || { content: "", loading: false, error: "", open: false };

  const updateAiState = (idx: number, update: Partial<typeof aiStates[number]>) => {
    setAiStates((prev) => {
      const current = prev[idx] || { content: "", loading: false, error: "", open: false };
      return {
        ...prev,
        [idx]: { ...current, ...update },
      };
    });
  };

  const handleGenerateDescriptions = async (
    idx: number,
    school: string,
    degree: string,
    customPrompt?: string
  ) => {
    updateAiState(idx, { open: true, loading: true, error: "", content: "" });

    try {
      const prompt = buildUniversalPrompt({
        sectionType: "educations",
        itemTitle: degree,
        itemSubtitle: school,
        existingItems: educations[idx]?.descriptions || [],
        customInstruction: customPrompt,
        resumeContext: {
          name: profile.name,
          targetRole: workExperiences[0]?.jobTitle || "Professional",
          allJobTitles: workExperiences.map((w) => w.jobTitle).filter(Boolean),
          skills: skills.descriptions,
        },
      });

      const result = await callAI({
        system: prompt.system,
        user: prompt.user,
        type: "education",
      });
      updateAiState(idx, { content: result, loading: false });
    } catch (error: any) {
      updateAiState(idx, { error: error.message, loading: false });
    }
  };

  const handleAcceptDescriptions = (idx: number) => {
    const state = getAiState(idx);
    const bullets = parseBulletPoints(state.content);
    if (bullets.length > 0) {
      dispatch(changeEducations({ idx, field: "descriptions", value: bullets } as any));
    }
    updateAiState(idx, { open: false, content: "" });
  };

  return (
    <Form form={form} addButtonText="Add School">
      {educations.map(({ school, degree, gpa, date, descriptions }, idx) => {
        const handleEducationChange = (
          ...[
            field,
            value,
          ]: CreateHandleChangeArgsWithDescriptions<ResumeEducation>
        ) => {
          dispatch(changeEducations({ idx, field, value } as any));
        };

        const handleShowBulletPoints = (value: boolean) => {
          dispatch(changeShowBulletPoints({ field: form, value }));
        };

        const showMoveUp = idx !== 0;
        const showMoveDown = idx !== educations.length - 1;
        const aiState = getAiState(idx);

        return (
          <FormSection
            key={idx}
            form="educations"
            idx={idx}
            showMoveUp={showMoveUp}
            showMoveDown={showMoveDown}
            showDelete={showDelete}
            deleteButtonTooltipText="Delete school"
          >
            <Input
              label="School"
              labelClassName="col-span-4"
              name="school"
              placeholder="Cornell University"
              value={school}
              onChange={handleEducationChange}
            />
            <Input
              label="Date"
              labelClassName="col-span-2"
              name="date"
              placeholder="May 2018"
              value={date}
              onChange={handleEducationChange}
            />
            <Input
              label="Degree & Major"
              labelClassName="col-span-4"
              name="degree"
              placeholder="Bachelor of Science in Computer Engineering"
              value={degree}
              onChange={handleEducationChange}
            />
            <Input
              label="GPA"
              labelClassName="col-span-2"
              name="gpa"
              placeholder="3.81"
              value={gpa}
              onChange={handleEducationChange}
            />
            <div className="relative col-span-full">
              <BulletListTextarea
                label="Additional Information (Optional)"
                labelClassName="col-span-full"
                name="descriptions"
                placeholder="Free paragraph space to list out additional activities, courses, awards etc"
                value={descriptions}
                onChange={handleEducationChange}
                showBulletPoints={showBulletPoints}
              />
              <div className="absolute left-[15.6rem] top-[0.07rem]">
                <BulletListIconButton
                  showBulletPoints={showBulletPoints}
                  onClick={handleShowBulletPoints}
                />
              </div>
            </div>
            <div className="col-span-full">
              <AIButton
                onClick={() =>
                  updateAiState(idx, { open: true, content: "", error: "", loading: false })
                }
                isLoading={aiState.loading}
                tooltipText="Write with AI"
                size="small"
              />
              <AIPanel
                isOpen={aiState.open}
                content={aiState.content}
                isLoading={aiState.loading}
                error={aiState.error}
                isBulletList={true}
                onAccept={() => handleAcceptDescriptions(idx)}
                onRegenerate={(prompt) =>
                  handleGenerateDescriptions(idx, school, degree, prompt)
                }
                onDiscard={() =>
                  updateAiState(idx, { open: false, content: "", error: "" })
                }
              />
            </div>
          </FormSection>
        );
      })}
    </Form>
  );
};
