"use client";
import { useState } from "react";
import { cx } from "lib/cx";
import { useAppSelector, useAppDispatch } from "lib/redux/hooks";
import {
  selectResume,
  changeProfile,
  changeWorkExperiences,
  changeSkills,
} from "lib/redux/resumeSlice";
import { callAI } from "lib/ai/ai-service";
import { buildSummaryPrompt, buildBulletPointsPrompt } from "lib/ai/ai-prompts";

/**
 * Floating action buttons that overlay on the resume preview,
 * providing "Rewrite with ChatGPT" and "Improve with ChatGPT" actions.
 */
export const ResumeAIOverlay = () => {
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [improveLoading, setImproveLoading] = useState(false);
  const resume = useAppSelector(selectResume);
  const dispatch = useAppDispatch();

  const handleRewriteSummary = async () => {
    setRewriteLoading(true);
    try {
      const latestWork = resume.workExperiences[0];
      const prompt = buildSummaryPrompt(
        resume.profile.name,
        latestWork?.jobTitle || "",
        latestWork?.company || "",
        resume.workExperiences,
        resume.skills.descriptions
      );
      const result = await callAI({
        system: prompt.system,
        user: prompt.user,
        type: "summary",
      });
      dispatch(changeProfile({ field: "summary", value: result }));
    } catch (error) {
      // silently fail — user can see error through the sidebar
    } finally {
      setRewriteLoading(false);
    }
  };

  const handleImproveExperience = async () => {
    setImproveLoading(true);
    try {
      const latestWork = resume.workExperiences[0];
      if (!latestWork) return;
      
      const prompt = buildBulletPointsPrompt(
        latestWork.jobTitle,
        latestWork.company,
        latestWork.descriptions
      );
      const result = await callAI({
        system: prompt.system,
        user: prompt.user,
        type: "bullet-points",
      });
      const bullets = result
        .split("\n")
        .map((l) => l.replace(/^[-•*]\s*/, "").replace(/^\d+[.)]\s*/, "").trim())
        .filter(Boolean);

      dispatch(
        changeWorkExperiences({
          idx: 0,
          field: "descriptions",
          value: bullets,
        } as any)
      );
    } catch (error) {
      // silently fail
    } finally {
      setImproveLoading(false);
    }
  };

  const handleGenerateSkills = async () => {
    setSkillsLoading(true);
    try {
      const jobTitles = resume.workExperiences.map((w) => w.jobTitle).filter(Boolean).join(", ");
      const result = await callAI({
        system: "You are a resume expert. Generate a bulleted list of 6-8 relevant technical and soft skills based on the user's job titles.",
        user: `Job Titles: ${jobTitles || "Software Engineer"}\nExisting Skills: ${resume.skills.descriptions.join(", ")}`,
        type: "skills",
      });
      const skillBullets = result
        .split("\n")
        .map((l) => l.replace(/^[-•*]\s*/, "").replace(/^\d+[.)]\s*/, "").trim())
        .filter(Boolean);

      dispatch(changeSkills({ field: "descriptions", value: skillBullets }));
    } catch (error) {
      // silently fail
    } finally {
      setSkillsLoading(false);
    }
  };

  const [skillsLoading, setSkillsLoading] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Rewrite Summary Button — positioned near top of resume */}
      <div className="pointer-events-auto absolute right-[-8px] top-[120px]">
        <button
          onClick={handleRewriteSummary}
          disabled={rewriteLoading}
          className={cx(
            "group flex items-center gap-1.5 rounded-l-lg rounded-r-none px-3 py-2 text-xs font-semibold shadow-lg transition-all duration-200",
            "bg-sky-500 text-white hover:bg-sky-600 hover:shadow-xl",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          {rewriteLoading ? (
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          )}
          <span className="whitespace-nowrap">Rewrite with AI</span>
        </button>
      </div>

      {/* Improve Experience Button — positioned near work experience section */}
      <div className="pointer-events-auto absolute right-[-8px] top-[260px]">
        <button
          onClick={handleImproveExperience}
          disabled={improveLoading}
          className={cx(
            "group flex items-center gap-1.5 rounded-l-lg rounded-r-none px-3 py-2 text-xs font-semibold shadow-lg transition-all duration-200",
            "bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:from-sky-600 hover:to-cyan-600 hover:shadow-xl",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          {improveLoading ? (
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          )}
          <span className="whitespace-nowrap">Improve with AI</span>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Generate Skills Button — positioned near skills section */}
      <div className="pointer-events-auto absolute right-[-8px] top-[400px]">
        <button
          onClick={handleGenerateSkills}
          disabled={skillsLoading}
          className={cx(
            "group flex items-center gap-1.5 rounded-l-lg rounded-r-none px-3 py-2 text-xs font-semibold shadow-lg transition-all duration-200",
            "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 hover:shadow-xl",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          {skillsLoading ? (
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          )}
          <span className="whitespace-nowrap">Skills with AI</span>
        </button>
      </div>
    </div>
  );
};
