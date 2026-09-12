import { useState } from "react";
import { Form } from "components/ResumeForm/Form";
import {
  BulletListTextarea,
  InputGroupWrapper,
} from "components/ResumeForm/Form/InputGroup";
import { FeaturedSkillInput } from "components/ResumeForm/Form/FeaturedSkillInput";
import { BulletListIconButton } from "components/ResumeForm/Form/IconButton";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { selectSkills, changeSkills, selectWorkExperiences, selectProfile } from "lib/redux/resumeSlice";
import {
  selectShowBulletPoints,
  changeShowBulletPoints,
  selectThemeColor,
} from "lib/redux/settingsSlice";
import { AIButton } from "components/AI/AIButton";
import { AIPanel } from "components/AI/AIPanel";
import { buildUniversalPrompt } from "lib/ai/ai-prompts";
import { callAI, parseBulletPoints } from "lib/ai/ai-service";

export const SkillsForm = () => {
  const skills = useAppSelector(selectSkills);
  const workExperiences = useAppSelector(selectWorkExperiences);
  const profile = useAppSelector(selectProfile);
  const dispatch = useAppDispatch();
  const { featuredSkills, descriptions } = skills;
  const form = "skills";
  const showBulletPoints = useAppSelector(selectShowBulletPoints(form));
  const themeColor = useAppSelector(selectThemeColor) || "#38bdf8";

  // AI state
  const [aiContent, setAiContent] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const handleSkillsChange = (field: "descriptions", value: string[]) => {
    dispatch(changeSkills({ field, value }));
  };
  const handleFeaturedSkillsChange = (
    idx: number,
    skill: string,
    rating: number
  ) => {
    dispatch(changeSkills({ field: "featuredSkills", idx, skill, rating }));
  };
  const handleShowBulletPoints = (value: boolean) => {
    dispatch(changeShowBulletPoints({ field: form, value }));
  };

  const handleGenerateSkills = async (customPrompt?: string) => {
    setAiPanelOpen(true);
    setAiLoading(true);
    setAiError("");
    setAiContent("");

    try {
      const prompt = buildUniversalPrompt({
        sectionType: "skills",
        existingItems: descriptions,
        customInstruction: customPrompt,
        resumeContext: {
          name: profile.name,
          targetRole: workExperiences[0]?.jobTitle || "Professional",
          allJobTitles: workExperiences.map((w) => w.jobTitle).filter(Boolean),
          skills: descriptions,
        },
      });

      const result = await callAI({
        system: prompt.system,
        user: prompt.user,
        type: "skills",
      });
      setAiContent(result);
    } catch (error: any) {
      setAiError(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptSkills = () => {
    const bullets = parseBulletPoints(aiContent);
    dispatch(changeSkills({ field: "descriptions", value: bullets }));
    setAiPanelOpen(false);
    setAiContent("");
  };

  return (
    <Form form={form}>
      <div className="col-span-full grid grid-cols-6 gap-3">
        <div className="relative col-span-full">
          <BulletListTextarea
            label="Skills List"
            labelClassName="col-span-full"
            name="descriptions"
            placeholder="Bullet points"
            value={descriptions}
            onChange={handleSkillsChange}
            showBulletPoints={showBulletPoints}
          />
          <div className="absolute left-[5.4rem] top-[0.07rem]">
            <BulletListIconButton
              showBulletPoints={showBulletPoints}
              onClick={handleShowBulletPoints}
            />
          </div>
        </div>

        <div className="col-span-full mt-1">
          <AIButton
            onClick={() => {
              setAiPanelOpen(true);
              setAiContent("");
              setAiError("");
              setAiLoading(false);
            }}
            isLoading={aiLoading}
            tooltipText="Write with AI"
            size="small"
          />
          <AIPanel
            isOpen={aiPanelOpen}
            content={aiContent}
            isLoading={aiLoading}
            error={aiError}
            isBulletList={true}
            onAccept={handleAcceptSkills}
            onRegenerate={(prompt) => handleGenerateSkills(prompt)}
            onDiscard={() => {
              setAiPanelOpen(false);
              setAiContent("");
              setAiError("");
            }}
          />
        </div>

        <div className="col-span-full mb-2 mt-4 border-t-2 border-dotted border-gray-200" />
        <InputGroupWrapper
          label="Featured Skills (Optional)"
          className="col-span-full"
        >
          <p className="mt-2 text-sm font-normal text-gray-600">
            Featured skills is optional to highlight top skills, with more circles mean higher proficiency.
          </p>
        </InputGroupWrapper>

        {featuredSkills.map(({ skill, rating }, idx) => (
          <FeaturedSkillInput
            key={idx}
            className="col-span-3"
            skill={skill}
            rating={rating}
            setSkillRating={(newSkill, newRating) => {
              handleFeaturedSkillsChange(idx, newSkill, newRating);
            }}
            placeholder={`Featured Skill ${idx + 1}`}
            circleColor={themeColor}
          />
        ))}
      </div>
    </Form>
  );
};
