"use client";
import { useState, useEffect } from "react";
import { cx } from "lib/cx";
import { useAppSelector } from "lib/redux/hooks";
import { selectResume } from "lib/redux/resumeSlice";
import { callAI, hasAPIKey } from "lib/ai/ai-service";

interface ReviewCategory {
  name: string;
  icon: string;
  score: number;
  maxScore: number;
  details: string;
  expanded: boolean;
}

interface SavedReview {
  totalScore: number;
  feedback: string;
  categories: ReviewCategory[];
  timestamp: number;
}

const STORAGE_KEY = "open-resume-review";

const INITIAL_CATEGORIES: ReviewCategory[] = [
  { name: "Structure", icon: "📋", score: 0, maxScore: 25, details: "", expanded: false },
  { name: "Skill Level Analysis", icon: "📊", score: 0, maxScore: 20, details: "", expanded: false },
  { name: "Contact Info", icon: "📞", score: 0, maxScore: 5, details: "", expanded: false },
  { name: "Reverse Chronology", icon: "📅", score: 0, maxScore: 20, details: "", expanded: false },
  { name: "Bullet Analysis", icon: "🎯", score: 0, maxScore: 50, details: "", expanded: false },
];

// Helper to extract JSON from AI markdown responses
const extractJSON = (text: string): any => {
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
};

export const ResumeReviewTab = () => {
  const resume = useAppSelector(selectResume);
  const [totalScore, setTotalScore] = useState(0);
  const [categories, setCategories] = useState<ReviewCategory[]>(INITIAL_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [lastReviewedAt, setLastReviewedAt] = useState("");

  // Restore last review from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: SavedReview = JSON.parse(saved);
        setTotalScore(data.totalScore);
        setFeedback(data.feedback);
        setCategories(data.categories);
        setHasReviewed(true);
        setLastReviewedAt(
          new Date(data.timestamp).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      }
    } catch {
      // ignore
    }
  }, []);

  // Save review results to localStorage
  const saveReview = (
    score: number,
    fb: string,
    cats: ReviewCategory[]
  ) => {
    const data: SavedReview = {
      totalScore: score,
      feedback: fb,
      categories: cats,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setLastReviewedAt(
      new Date(data.timestamp).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const handleAnalyze = async () => {
    if (!hasAPIKey()) {
      setError("Please set your Gemini API key in AI Settings first.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Build resume context
      const resumeText = buildResumeText();

      const result = await callAI({
        system: `You are a professional resume reviewer. Analyze the given resume and provide a detailed score breakdown.

CRITICAL: Return ONLY raw JSON. Do not wrap in markdown codeblocks. Do not add intro/outro text.

Response format:
{
  "totalScore": 75,
  "feedback": "Concise 1-2 sentence overall review summary.",
  "categories": [
    {"name": "Structure", "score": 20, "details": "Clear layout and sections."},
    {"name": "Skill Level Analysis", "score": 15, "details": "Good technical skills listed."},
    {"name": "Contact Info", "score": 5, "details": "All contact info present."},
    {"name": "Reverse Chronology", "score": 18, "details": "Proper date formatting."},
    {"name": "Bullet Analysis", "score": 35, "details": "Bullet points are detailed and metric-driven."}
  ]
}

Score fairly based on actual content quality.`,
        user: `Review this resume:\n\n${resumeText}`,
        type: "chat",
      });

      try {
        const parsed = extractJSON(result);
        const newCats = INITIAL_CATEGORIES.map((cat, i) => ({
          ...cat,
          score: typeof parsed.categories?.[i]?.score === "number" ? parsed.categories[i].score : 0,
          details: parsed.categories?.[i]?.details || "",
        }));
        const score = typeof parsed.totalScore === "number" ? parsed.totalScore : 70;
        const fb = parsed.feedback || "Resume review complete.";
        setTotalScore(score);
        setFeedback(fb);
        setCategories(newCats);
        setHasReviewed(true);
        saveReview(score, fb, newCats);
      } catch (parseErr) {
        console.error("Failed to parse review JSON:", result, parseErr);
        setError("Unable to parse review response. Retrying may resolve formatting issues.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const buildResumeText = (): string => {
    const parts: string[] = [];

    if (resume.profile.name) parts.push(`Name: ${resume.profile.name}`);
    if (resume.profile.email) parts.push(`Email: ${resume.profile.email}`);
    if (resume.profile.phone) parts.push(`Phone: ${resume.profile.phone}`);
    if (resume.profile.location) parts.push(`Location: ${resume.profile.location}`);
    if (resume.profile.url) parts.push(`Website: ${resume.profile.url}`);
    if (resume.profile.summary) parts.push(`\nSUMMARY:\n${resume.profile.summary}`);

    if (resume.workExperiences.some((w) => w.jobTitle || w.company)) {
      parts.push("\nWORK EXPERIENCE:");
      resume.workExperiences.forEach((w) => {
        if (w.jobTitle || w.company) {
          parts.push(`${w.jobTitle} at ${w.company} (${w.date})`);
          w.descriptions.filter(Boolean).forEach((d) => parts.push(`  • ${d}`));
        }
      });
    }

    if (resume.educations.some((e) => e.school || e.degree)) {
      parts.push("\nEDUCATION:");
      resume.educations.forEach((e) => {
        if (e.school || e.degree) {
          parts.push(`${e.degree} - ${e.school} (${e.date}) GPA: ${e.gpa}`);
          e.descriptions.filter(Boolean).forEach((d) => parts.push(`  • ${d}`));
        }
      });
    }

    if (resume.projects.some((p) => p.project)) {
      parts.push("\nPROJECTS:");
      resume.projects.forEach((p) => {
        if (p.project) {
          parts.push(`${p.project} (${p.date})`);
          p.descriptions.filter(Boolean).forEach((d) => parts.push(`  • ${d}`));
        }
      });
    }

    if (resume.skills.descriptions.length > 0) {
      parts.push(`\nSKILLS: ${resume.skills.descriptions.join(", ")}`);
    }

    return parts.join("\n") || "Empty resume - no content provided.";
  };

  const toggleCategory = (index: number) => {
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === index ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-500";
  };

  const getProgressColor = (score: number): string => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="p-4">
      {!hasReviewed && !isLoading && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
            <svg
              className="h-8 w-8 text-sky-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
              />
            </svg>
          </div>
          <p className="text-center text-sm text-gray-500">
            Get an AI-powered review of your resume with actionable scoring and
            feedback.
          </p>
          <button
            onClick={handleAnalyze}
            className="w-full rounded-lg bg-gradient-to-r from-sky-400 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-sky-500 hover:to-sky-600 hover:shadow-md"
          >
            ✨ Analyze My Resume
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="h-16 w-16 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
          <p className="text-sm font-medium text-gray-600">
            Analyzing your resume...
          </p>
          <p className="text-xs text-gray-400">This may take a few seconds</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
          <button
            onClick={handleAnalyze}
            className="mt-2 block text-xs font-medium text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Score Display */}
      {hasReviewed && (
        <div>
          {/* Overall Score */}
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className={cx("text-4xl font-bold", getScoreColor(totalScore))}>
                {totalScore}
              </span>
              <span className="text-lg text-gray-400">/100</span>
              {/* Refresh Button */}
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="ml-auto rounded-md p-1.5 text-sky-500 transition-colors hover:bg-sky-50 disabled:opacity-50"
                title="Re-analyze after changes"
              >
                <svg
                  className={cx("h-4 w-4", isLoading && "animate-spin")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                  />
                </svg>
              </button>
            </div>
            {/* Progress Bar */}
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={cx(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  getProgressColor(totalScore)
                )}
                style={{ width: `${totalScore}%` }}
              />
            </div>
            {/* Last reviewed + AI Badge */}
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Fair scoring powered by responsible AI
              </span>
            </div>
            {lastReviewedAt && (
              <p className="mt-1 text-[10px] text-gray-400">
                Last reviewed: {lastReviewedAt}
              </p>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <p className="mb-4 text-sm leading-relaxed text-gray-600">
              {feedback}
            </p>
          )}

          {/* Category Breakdown */}
          <div className="space-y-1">
            {categories.map((cat, i) => (
              <div key={cat.name} className="overflow-hidden rounded-lg border border-gray-100">
                <button
                  onClick={() => toggleCategory(i)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span className="flex-1 text-sm font-medium text-gray-800">
                    {cat.name}
                  </span>
                  <span className="text-xs font-semibold text-green-600">
                    ✓ {cat.score}/{cat.maxScore}
                  </span>
                  <svg
                    className={cx(
                      "h-4 w-4 text-gray-400 transition-transform duration-200",
                      cat.expanded && "rotate-180"
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                {cat.expanded && cat.details && (
                  <div className="border-t border-gray-50 bg-gray-50/50 px-3 py-2.5">
                    <p className="text-xs leading-relaxed text-gray-600">
                      {cat.details}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Re-review button */}
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="mt-4 w-full rounded-lg border border-sky-200 bg-white px-4 py-2 text-sm font-medium text-sky-600 transition-all hover:bg-sky-50 disabled:opacity-50"
          >
            {isLoading ? "Analyzing..." : "🔄 Re-review After Changes"}
          </button>

          {/* Helpful? */}
          <div className="mt-4 flex items-center justify-center gap-3 border-t border-gray-100 pt-4">
            <span className="text-xs text-gray-400">Is this review helpful?</span>
            <button className="text-gray-400 transition-colors hover:text-green-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
              </svg>
            </button>
            <button className="text-gray-400 transition-colors hover:text-red-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 001.302-4.665c0-1.194-.232-2.333-.654-3.375z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
