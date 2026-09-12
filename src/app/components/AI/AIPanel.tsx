"use client";
import { useState, useEffect, useRef } from "react";
import { cx } from "lib/cx";

import { parseBulletPoints } from "lib/ai/ai-service";

interface AIPanelProps {
  isOpen: boolean;
  content: string;
  isLoading: boolean;
  error?: string;
  onAccept: () => void;
  onRegenerate: (customPrompt?: string) => void;
  onDiscard: () => void;
  /** If content is an array of bullet points, display them as a list */
  isBulletList?: boolean;
}

/**
 * Panel that slides in to display AI-generated content.
 * Shows Accept / Custom Prompt / Regenerate / Discard controls.
 */
export const AIPanel = ({
  isOpen,
  content,
  isLoading,
  error,
  onAccept,
  onRegenerate,
  onDiscard,
  isBulletList = false,
}: AIPanelProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  // Typing animation effect
  useEffect(() => {
    if (!content || isLoading) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setDisplayedText("");
    let idx = 0;
    const speed = 15; // ms per character

    const interval = setInterval(() => {
      if (idx < content.length) {
        setDisplayedText(content.slice(0, idx + 1));
        idx++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [content, isLoading]);

  // Scroll into view when opened
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className={cx(
        "mt-3 overflow-hidden rounded-xl border transition-all duration-300",
        "border-purple-200 bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/80",
        "shadow-lg shadow-purple-100/50",
        "animate-ai-slide-in"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2.5">
        <svg
          className="h-4 w-4 text-purple-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
          />
        </svg>
        <span className="text-sm font-semibold text-purple-700">
          AI Content Assistant
        </span>
        {isTyping && (
          <span className="ml-auto text-xs text-purple-400 animate-pulse">
            typing...
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="px-4 py-3">
        {!content && !isLoading && !error ? (
          <div className="py-1">
            <p className="text-xs font-semibold text-purple-900">
              What would you like the AI to focus on?
            </p>
            <p className="mb-2.5 text-[11px] text-gray-500">
              Optional: Enter keywords, specific tech stack, or instructions below.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onRegenerate(customPrompt);
                  }
                }}
                autoFocus
                placeholder='e.g. "Focus on React, AWS, metrics & team leadership"'
                className="flex-1 min-w-[220px] rounded-lg border border-purple-300 bg-white px-3 py-1.5 text-xs text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-300"
              />
              <button
                type="button"
                onClick={() => onRegenerate(customPrompt)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow transition-all hover:from-violet-700 hover:to-purple-700"
              >
                ✨ Generate
              </button>
              <button
                type="button"
                onClick={() => onRegenerate("")}
                className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-white px-3 py-1.5 text-xs font-medium text-purple-700 shadow-sm hover:bg-purple-50"
              >
                ⚡ Auto-Generate
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center gap-3 py-4">
            <div className="ai-loading-dots flex gap-1">
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-sm font-medium text-purple-600">
              Generating tailored content...
            </span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : isBulletList ? (
          <ul className="space-y-1.5 pl-1">
            {parseBulletPoints(displayedText).map((line, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-0.5 h-4 bg-purple-500 animate-ai-cursor ml-0.5 align-text-bottom" />
            )}
          </p>
        )}
      </div>

      {/* Refine Prompt Bar */}
      {!isLoading && content && (
        <div className="border-t border-purple-100/60 bg-purple-50/40 px-3.5 py-2 flex items-center gap-2">
          <span className="text-xs font-semibold text-purple-800 whitespace-nowrap">
            💡 Refine Prompt:
          </span>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onRegenerate(customPrompt);
              }
            }}
            placeholder='e.g. "Add metrics", "Focus on React", or "Make it concise"'
            className="flex-1 rounded-md border border-purple-200 bg-white px-2.5 py-1 text-xs text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-200"
          />
          <button
            type="button"
            onClick={() => onRegenerate(customPrompt)}
            className="rounded-md bg-purple-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition-all hover:bg-purple-700 whitespace-nowrap"
          >
            ✨ Apply Prompt
          </button>
        </div>
      )}

      {/* Actions */}
      {!isLoading && content && (
        <div className="flex items-center gap-2 border-t border-purple-100 bg-purple-50/50 px-4 py-2.5">
          <button
            type="button"
            onClick={onAccept}
            disabled={isTyping}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md hover:from-violet-600 hover:to-purple-700 disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Accept
          </button>
          <button
            type="button"
            onClick={() => onRegenerate(customPrompt)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-purple-700 shadow-sm transition-all hover:bg-purple-50 hover:border-purple-300"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Regenerate
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="ml-auto inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Discard
          </button>
        </div>
      )}

      {/* Error actions */}
      {!isLoading && error && (
        <div className="flex items-center gap-2 border-t border-red-100 bg-red-50/50 px-4 py-2.5">
          <button
            type="button"
            onClick={() => onRegenerate(customPrompt)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-red-600"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="ml-auto inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
