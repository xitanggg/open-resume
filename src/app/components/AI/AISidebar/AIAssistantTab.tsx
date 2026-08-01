"use client";
import { useState } from "react";
import { cx } from "lib/cx";
import { useAppSelector, useAppDispatch } from "lib/redux/hooks";
import {
  selectResume,
  selectWorkExperiences,
  changeWorkExperiences,
} from "lib/redux/resumeSlice";
import { callAI, parseBulletPoints, hasAPIKey } from "lib/ai/ai-service";
import { buildBulletPointsPrompt } from "lib/ai/ai-prompts";

interface RecommendedBullet {
  text: string;
  added: boolean;
}

export const AIAssistantTab = () => {
  const resume = useAppSelector(selectResume);
  const workExperiences = useAppSelector(selectWorkExperiences);
  const dispatch = useAppDispatch();

  const [keywords, setKeywords] = useState("");
  const [bullets, setBullets] = useState<RecommendedBullet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!hasAPIKey()) {
      setError("Please set your Gemini API key in AI Settings first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setBullets([]);

    try {
      const latestWork = workExperiences[0];
      const jobTitle = latestWork?.jobTitle || "Professional";
      const company = latestWork?.company || "";

      // Build a prompt that incorporates keywords
      const keywordContext = keywords.trim()
        ? `\n\nIMPORTANT: Incorporate these keywords naturally: ${keywords}`
        : "";

      const prompt = buildBulletPointsPrompt(
        jobTitle,
        company,
        latestWork?.descriptions || []
      );

      const result = await callAI({
        system: prompt.system,
        user: prompt.user + keywordContext,
        type: "bullet-points",
      });

      const parsed = parseBulletPoints(result);
      setBullets(parsed.map((text) => ({ text, added: false })));
      setHasGenerated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBullet = (index: number) => {
    if (workExperiences.length === 0) return;

    const bullet = bullets[index];
    const currentDescriptions = workExperiences[0].descriptions;
    const newDescriptions = [...currentDescriptions, bullet.text];

    dispatch(
      changeWorkExperiences({
        idx: 0,
        field: "descriptions",
        value: newDescriptions,
      } as any)
    );

    setBullets((prev) =>
      prev.map((b, i) => (i === index ? { ...b, added: true } : b))
    );
  };

  return (
    <div className="p-4">
      {/* Search / Keywords Input */}
      <div className="relative mb-4">
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="Enter Keywords"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleGenerate();
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:text-sky-500"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
      </div>

      {/* Generate Button */}
      {!hasGenerated && !isLoading && (
        <button
          onClick={handleGenerate}
          className="w-full rounded-lg bg-gradient-to-r from-sky-400 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-sky-500 hover:to-sky-600 hover:shadow-md"
        >
          ✨ Generate Recommended Bullets
        </button>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-sm text-gray-500">Generating bullet points...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Recommended Bullets Section */}
      {bullets.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-gray-900">
            Recommended Bullets
          </h3>
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2">
            <span className="text-xs text-sky-600">
              Add to resume and edit there
            </span>
            <button
              onClick={() => setBullets([])}
              className="ml-auto text-sky-400 hover:text-sky-600"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {bullets.map((bullet, i) => (
              <div
                key={i}
                className={cx(
                  "group flex gap-3 rounded-lg border p-3 transition-all duration-200",
                  bullet.added
                    ? "border-green-200 bg-green-50 opacity-60"
                    : "border-gray-100 bg-white hover:border-sky-200 hover:shadow-sm"
                )}
              >
                <button
                  onClick={() => handleAddBullet(i)}
                  disabled={bullet.added}
                  className={cx(
                    "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-all",
                    bullet.added
                      ? "bg-green-500 text-white"
                      : "text-sky-400 hover:bg-sky-50 hover:text-sky-600"
                  )}
                >
                  {bullet.added ? (
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  )}
                </button>
                <p className="text-sm leading-relaxed text-gray-700">
                  {bullet.text}
                </p>
              </div>
            ))}
          </div>

          {/* Regenerate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="mt-4 w-full rounded-lg border border-sky-200 bg-white px-4 py-2 text-sm font-medium text-sky-600 transition-all hover:bg-sky-50 disabled:opacity-50"
          >
            🔄 Generate More
          </button>
        </div>
      )}
    </div>
  );
};
