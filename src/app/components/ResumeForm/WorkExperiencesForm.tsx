"use client";
import { useState } from "react";
import { Form, FormSection } from "components/ResumeForm/Form";
import {
  Input,
  BulletListTextarea,
} from "components/ResumeForm/Form/InputGroup";
import type { CreateHandleChangeArgsWithDescriptions } from "components/ResumeForm/types";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import {
  changeWorkExperiences,
  selectWorkExperiences,
} from "lib/redux/resumeSlice";
import type { ResumeWorkExperience } from "lib/redux/types";
import { AIButton } from "components/AI/AIButton";
import { AIPanel } from "components/AI/AIPanel";
import { callAI, parseBulletPoints } from "lib/ai/ai-service";
import { buildUniversalPrompt } from "lib/ai/ai-prompts";
import { selectProfile, selectSkills } from "lib/redux/resumeSlice";

export const WorkExperiencesForm = () => {
  const workExperiences = useAppSelector(selectWorkExperiences);
  const profile = useAppSelector(selectProfile);
  const skills = useAppSelector(selectSkills);
  const dispatch = useAppDispatch();

  const showDelete = workExperiences.length > 1;

  // AI state per section (keyed by index)
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

  const handleGenerateBulletPoints = async (
    idx: number,
    jobTitle: string,
    company: string,
    existingDescriptions: string[],
    customPrompt?: string
  ) => {
    updateAiState(idx, { open: true, loading: true, error: "", content: "" });

    try {
      const prompt = buildUniversalPrompt({
        sectionType: "workExperiences",
        itemTitle: jobTitle,
        itemSubtitle: company,
        existingItems: existingDescriptions,
        customInstruction: customPrompt,
        resumeContext: {
          name: profile.name,
          targetRole: workExperiences[0]?.jobTitle || "Software Engineer",
          allJobTitles: workExperiences.map((w) => w.jobTitle).filter(Boolean),
          skills: skills.descriptions,
        },
      });

      const result = await callAI({
        system: prompt.system,
        user: prompt.user,
        type: "bullet-points",
      });
      updateAiState(idx, { content: result, loading: false });
    } catch (error: any) {
      updateAiState(idx, { error: error.message, loading: false });
    }
  };

  const handleAcceptBulletPoints = (idx: number) => {
    const state = getAiState(idx);
    const bullets = parseBulletPoints(state.content);
    if (bullets.length > 0) {
      dispatch(
        changeWorkExperiences({ idx, field: "descriptions", value: bullets } as any)
      );
    }
    updateAiState(idx, { open: false, content: "" });
  };

  return (
    <Form form="workExperiences" addButtonText="Add Job">
      {workExperiences.map(({ company, jobTitle, date, descriptions }, idx) => {
        const handleWorkExperienceChange = (
          ...[
            field,
            value,
          ]: CreateHandleChangeArgsWithDescriptions<ResumeWorkExperience>
        ) => {
          dispatch(changeWorkExperiences({ idx, field, value } as any));
        };
        const showMoveUp = idx !== 0;
        const showMoveDown = idx !== workExperiences.length - 1;
        const aiState = getAiState(idx);

        return (
          <FormSection
            key={idx}
            form="workExperiences"
            idx={idx}
            showMoveUp={showMoveUp}
            showMoveDown={showMoveDown}
            showDelete={showDelete}
            deleteButtonTooltipText="Delete job"
          >
            <Input
              label="Company"
              labelClassName="col-span-full"
              name="company"
              placeholder="Khan Academy"
              value={company}
              onChange={handleWorkExperienceChange}
            />
            <Input
              label="Job Title"
              labelClassName="col-span-4"
              name="jobTitle"
              placeholder="Software Engineer"
              value={jobTitle}
              onChange={handleWorkExperienceChange}
            />
            <Input
              label="Date"
              labelClassName="col-span-2"
              name="date"
              placeholder="Jun 2022 - Present"
              value={date}
              onChange={handleWorkExperienceChange}
            />
            <BulletListTextarea
              label="Description"
              labelClassName="col-span-full"
              name="descriptions"
              placeholder="Bullet points"
              value={descriptions}
              onChange={handleWorkExperienceChange}
            />
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
                onAccept={() => handleAcceptBulletPoints(idx)}
                onRegenerate={(prompt) =>
                  handleGenerateBulletPoints(idx, jobTitle, company, descriptions, prompt)
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
