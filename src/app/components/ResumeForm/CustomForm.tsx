import { useState } from "react";
import { Form } from "components/ResumeForm/Form";
import { BulletListIconButton } from "components/ResumeForm/Form/IconButton";
import { BulletListTextarea } from "components/ResumeForm/Form/InputGroup";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import {
  changeCustomSection,
  selectCustomSectionById,
  selectProfile,
} from "lib/redux/resumeSlice";
import {
  selectShowBulletPoints,
  changeShowBulletPoints,
  selectFormToHeading,
} from "lib/redux/settingsSlice";
import { AIButton } from "components/AI/AIButton";
import { AIPanel } from "components/AI/AIPanel";
import { buildUniversalPrompt } from "lib/ai/ai-prompts";
import { callAI, parseBulletPoints } from "lib/ai/ai-service";
import { selectWorkExperiences, selectSkills } from "lib/redux/resumeSlice";

export const CustomForm = ({ sectionId }: { sectionId: string }) => {
  const section = useAppSelector(selectCustomSectionById(sectionId));
  const formToHeading = useAppSelector(selectFormToHeading);
  const profile = useAppSelector(selectProfile);
  const workExperiences = useAppSelector(selectWorkExperiences);
  const skills = useAppSelector(selectSkills);
  const dispatch = useAppDispatch();
  const descriptions = section?.descriptions ?? [];
  const showBulletPoints = useAppSelector(selectShowBulletPoints(sectionId));
  const sectionTitle = formToHeading[sectionId] || "Custom Section";

  // AI state
  const [aiContent, setAiContent] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const handleCustomChange = (field: "descriptions", value: string[]) => {
    dispatch(changeCustomSection({ sectionId, field, value }));
  };

  const handleShowBulletPoints = (value: boolean) => {
    dispatch(changeShowBulletPoints({ field: sectionId, value }));
  };

  const handleGenerateCustom = async (customPrompt?: string) => {
    setAiPanelOpen(true);
    setAiLoading(true);
    setAiError("");
    setAiContent("");

    try {
      const prompt = buildUniversalPrompt({
        sectionType: "custom",
        sectionTitle,
        existingItems: descriptions,
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
        type: "bullet-points",
      });
      setAiContent(result);
    } catch (error: any) {
      setAiError(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptCustom = () => {
    const bullets = parseBulletPoints(aiContent);
    dispatch(changeCustomSection({ sectionId, field: "descriptions", value: bullets }));
    setAiPanelOpen(false);
    setAiContent("");
  };

  return (
    <Form form={sectionId}>
      <div className="col-span-full grid grid-cols-6 gap-3">
        <div className="relative col-span-full">
          <BulletListTextarea
            label="Custom Textbox"
            labelClassName="col-span-full"
            name="descriptions"
            placeholder="Bullet points"
            value={descriptions}
            onChange={handleCustomChange}
            showBulletPoints={showBulletPoints ?? true}
          />
          <div className="absolute left-[7.7rem] top-[0.07rem]">
            <BulletListIconButton
              showBulletPoints={showBulletPoints ?? true}
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
            onAccept={handleAcceptCustom}
            onRegenerate={(prompt) => handleGenerateCustom(prompt)}
            onDiscard={() => {
              setAiPanelOpen(false);
              setAiContent("");
              setAiError("");
            }}
          />
        </div>
      </div>
    </Form>
  );
};
