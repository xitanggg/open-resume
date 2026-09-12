"use client";
import { useState } from "react";
import { Form, FormSection } from "components/ResumeForm/Form";
import {
  Input,
  BulletListTextarea,
} from "components/ResumeForm/Form/InputGroup";
import type { CreateHandleChangeArgsWithDescriptions } from "components/ResumeForm/types";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { selectProjects, changeProjects } from "lib/redux/resumeSlice";
import type { ResumeProject } from "lib/redux/types";
import { AIButton } from "components/AI/AIButton";
import { AIPanel } from "components/AI/AIPanel";
import { callAI, parseBulletPoints } from "lib/ai/ai-service";
import { buildUniversalPrompt } from "lib/ai/ai-prompts";
import { selectProfile, selectWorkExperiences, selectSkills } from "lib/redux/resumeSlice";

export const ProjectsForm = () => {
  const projects = useAppSelector(selectProjects);
  const profile = useAppSelector(selectProfile);
  const workExperiences = useAppSelector(selectWorkExperiences);
  const skills = useAppSelector(selectSkills);
  const dispatch = useAppDispatch();
  const showDelete = projects.length > 1;

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

  const handleGenerateBulletPoints = async (
    idx: number,
    projectName: string,
    existingDescriptions: string[],
    customPrompt?: string
  ) => {
    updateAiState(idx, { open: true, loading: true, error: "", content: "" });

    try {
      const prompt = buildUniversalPrompt({
        sectionType: "projects",
        itemTitle: projectName,
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
      dispatch(changeProjects({ idx, field: "descriptions", value: bullets } as any));
    }
    updateAiState(idx, { open: false, content: "" });
  };

  return (
    <Form form="projects" addButtonText="Add Project">
      {projects.map(({ project, date, descriptions }, idx) => {
        const handleProjectChange = (
          ...[
            field,
            value,
          ]: CreateHandleChangeArgsWithDescriptions<ResumeProject>
        ) => {
          dispatch(changeProjects({ idx, field, value } as any));
        };
        const showMoveUp = idx !== 0;
        const showMoveDown = idx !== projects.length - 1;
        const aiState = getAiState(idx);

        return (
          <FormSection
            key={idx}
            form="projects"
            idx={idx}
            showMoveUp={showMoveUp}
            showMoveDown={showMoveDown}
            showDelete={showDelete}
            deleteButtonTooltipText={"Delete project"}
          >
            <Input
              name="project"
              label="Project Name"
              placeholder="OpenResume"
              value={project}
              onChange={handleProjectChange}
              labelClassName="col-span-4"
            />
            <Input
              name="date"
              label="Date"
              placeholder="Winter 2022"
              value={date}
              onChange={handleProjectChange}
              labelClassName="col-span-2"
            />
            <BulletListTextarea
              name="descriptions"
              label="Description"
              placeholder="Bullet points"
              value={descriptions}
              onChange={handleProjectChange}
              labelClassName="col-span-full"
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
                  handleGenerateBulletPoints(idx, project, descriptions, prompt)
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
