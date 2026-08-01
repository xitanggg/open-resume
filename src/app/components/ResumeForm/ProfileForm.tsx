"use client";
import { useState } from "react";
import { BaseForm } from "components/ResumeForm/Form";
import { Input, Textarea } from "components/ResumeForm/Form/InputGroup";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { changeProfile, selectProfile, selectWorkExperiences, selectSkills } from "lib/redux/resumeSlice";
import { ResumeProfile } from "lib/redux/types";
import { AIButton } from "components/AI/AIButton";
import { AIPanel } from "components/AI/AIPanel";
import { callAI, parseBulletPoints } from "lib/ai/ai-service";
import { buildUniversalPrompt } from "lib/ai/ai-prompts";

export const ProfileForm = () => {
  const profile = useAppSelector(selectProfile);
  const workExperiences = useAppSelector(selectWorkExperiences);
  const skills = useAppSelector(selectSkills);
  const dispatch = useAppDispatch();
  const { name, email, phone, url, summary, location } = profile;

  // AI state
  const [aiContent, setAiContent] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const handleProfileChange = (field: keyof ResumeProfile, value: string) => {
    dispatch(changeProfile({ field, value }));
  };

  const handleGenerateSummary = async (customPrompt?: string) => {
    setAiPanelOpen(true);
    setAiLoading(true);
    setAiError("");
    setAiContent("");

    try {
      const prompt = buildUniversalPrompt({
        sectionType: "summary",
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
        type: "summary",
      });
      setAiContent(result);
    } catch (error: any) {
      setAiError(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptSummary = () => {
    const cleaned = aiContent
      .replace(/```[a-z]*\n?/gi, "")
      .replace(/```/g, "")
      .replace(/^["']|["']$/g, "")
      .trim();
    dispatch(changeProfile({ field: "summary", value: cleaned }));
    setAiPanelOpen(false);
    setAiContent("");
  };

  return (
    <BaseForm>
      <div className="grid grid-cols-6 gap-3">
        <Input
          label="Name"
          labelClassName="col-span-full"
          name="name"
          placeholder="Sal Khan"
          value={name}
          onChange={handleProfileChange}
        />
        <div className="col-span-full">
          <div className="flex items-center justify-between">
            <Textarea
              label="Objective"
              labelClassName="flex-1"
              name="summary"
              placeholder="Entrepreneur and educator obsessed with making education free for anyone"
              value={summary}
              onChange={handleProfileChange}
            />
          </div>
          <div className="mt-2">
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
          </div>
          <AIPanel
            isOpen={aiPanelOpen}
            content={aiContent}
            isLoading={aiLoading}
            error={aiError}
            onAccept={handleAcceptSummary}
            onRegenerate={handleGenerateSummary}
            onDiscard={() => {
              setAiPanelOpen(false);
              setAiContent("");
              setAiError("");
            }}
          />
        </div>
        <Input
          label="Email"
          labelClassName="col-span-4"
          name="email"
          placeholder="hello@khanacademy.org"
          value={email}
          onChange={handleProfileChange}
        />
        <Input
          label="Phone"
          labelClassName="col-span-2"
          name="phone"
          placeholder="(123)456-7890"
          value={phone}
          onChange={handleProfileChange}
        />
        <Input
          label="Website"
          labelClassName="col-span-4"
          name="url"
          placeholder="linkedin.com/in/khanacademy"
          value={url}
          onChange={handleProfileChange}
        />
        <Input
          label="Location"
          labelClassName="col-span-2"
          name="location"
          placeholder="NYC, NY"
          value={location}
          onChange={handleProfileChange}
        />
      </div>
    </BaseForm>
  );
};
