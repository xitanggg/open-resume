"use client";
import { useState, useEffect } from "react";
import { cx } from "lib/cx";
import { useAppSelector } from "lib/redux/hooks";
import { selectResume } from "lib/redux/resumeSlice";
import { callAI, hasAPIKey } from "lib/ai/ai-service";

interface MatchResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

interface SavedJobMatch {
  jobDescription: string;
  result: MatchResult;
  timestamp: number;
}

const STORAGE_KEY = "open-resume-job-match";

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

export const JobMatchTab = () => {
  const resume = useAppSelector(selectResume);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [lastMatchedAt, setLastMatchedAt] = useState("");

  // Restore last job match from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: SavedJobMatch = JSON.parse(saved);
        setJobDescription(data.jobDescription);
        setResult(data.result);
        setLastMatchedAt(
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

  // Save job match results to localStorage
  const saveMatch = (jd: string, res: MatchResult) => {
    const data: SavedJobMatch = {
      jobDescription: jd,
      result: res,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setLastMatchedAt(
      new Date(data.timestamp).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const buildResumeText = (): string => {
    const parts: string[] = [];
    if (resume.profile.summary) parts.push(resume.profile.summary);
    resume.workExperiences.forEach((w) => {
      if (w.jobTitle) parts.push(w.jobTitle);
      if (w.company) parts.push(w.company);
      w.descriptions.filter(Boolean).forEach((d) => parts.push(d));
    });
    resume.educations.forEach((e) => {
      if (e.degree) parts.push(e.degree);
      if (e.school) parts.push(e.school);
      e.descriptions.filter(Boolean).forEach((d) => parts.push(d));
    });
    resume.projects.forEach((p) => {
      if (p.project) parts.push(p.project);
      p.descriptions.filter(Boolean).forEach((d) => parts.push(d));
    });
    if (resume.skills.descriptions.length > 0) {
      parts.push(resume.skills.descriptions.join(", "));
    }
    resume.skills.featuredSkills.forEach((s) => {
      if (s.skill) parts.push(s.skill);
    });
    return parts.join(" ");
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description first.");
      return;
    }

    if (!hasAPIKey()) {
      setError("Please set your Gemini API key in AI Settings first.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const resumeText = buildResumeText();

      const response = await callAI({
        system: `You are a job matching expert. Compare a resume against a job description and analyze keyword match.

CRITICAL: Return ONLY raw JSON. Do not wrap in markdown codeblocks. Do not add intro/outro text.

Response format:
{
  "score": 85,
  "matchedKeywords": ["React", "TypeScript", "Next.js"],
  "missingKeywords": ["GraphQL", "Docker"],
  "suggestions": ["Add GraphQL experience if applicable", "Mention containerization tools"]
}`,
        user: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
        type: "chat",
      });

      try {
        const parsed = extractJSON(response);
        setResult(parsed);
        saveMatch(jobDescription, parsed);
      } catch (parseErr) {
        console.error("Failed to parse Job Match JSON:", response, parseErr);
        setError("Unable to parse match response. Retrying may resolve formatting issues.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Job Description Input */}
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h3 className="text-sm font-bold text-gray-900">
            Paste the Job Description below.
          </h3>
        </div>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="To match your resume, copy and paste the job description here"
          className="h-40 w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
        {lastMatchedAt && !isLoading && (
          <p className="mt-1 text-[10px] text-gray-400">
            Last matched: {lastMatchedAt}
          </p>
        )}
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={isLoading || !jobDescription.trim()}
        className={cx(
          "w-full rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all",
          isLoading || !jobDescription.trim()
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 hover:shadow-md"
        )}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing...
          </span>
        ) : result ? (
          "🔄 Re-analyze After Changes"
        ) : (
          "Analyze"
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-5 animate-ai-slide-in">
          {/* Match Score */}
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-sky-50 to-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Job Match Score
              </span>
              <span
                className={cx(
                  "text-3xl font-bold",
                  result.score >= 70
                    ? "text-green-600"
                    : result.score >= 50
                    ? "text-yellow-600"
                    : "text-red-500"
                )}
              >
                {result.score}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={cx(
                  "h-full rounded-full transition-all duration-1000",
                  result.score >= 70
                    ? "bg-green-500"
                    : result.score >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                )}
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>

          {/* Matched Keywords */}
          {result.matchedKeywords.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-green-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Matched Keywords ({result.matchedKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 border border-green-100"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {result.missingKeywords.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Missing Keywords ({result.missingKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 border border-red-100"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-800">
                💡 Suggestions to Improve Match
              </h4>
              <div className="space-y-2">
                {result.suggestions.map((sug, i) => (
                  <div
                    key={i}
                    className="flex gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-600">
                      {i + 1}
                    </span>
                    <p className="text-xs leading-relaxed text-gray-700">{sug}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
