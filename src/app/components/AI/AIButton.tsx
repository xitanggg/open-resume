"use client";
import { cx } from "lib/cx";

interface AIButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  tooltipText?: string;
  size?: "small" | "normal";
  className?: string;
}

/**
 * Sparkle button that triggers AI generation.
 * Sits inline next to form fields.
 */
export const AIButton = ({
  onClick,
  isLoading = false,
  tooltipText = "Write with AI",
  size = "normal",
  className,
}: AIButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      title={tooltipText}
      className={cx(
        "group relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300",
        "bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white",
        "hover:from-violet-600 hover:via-purple-600 hover:to-indigo-600",
        "hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5",
        "active:translate-y-0 active:shadow-md",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500",
        size === "small" ? "gap-1 px-2.5 py-1.5 text-xs" : "gap-1.5 px-3 py-2 text-sm",
        className
      )}
    >
      {/* Animated glow background */}
      <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-50" />
      
      {/* Sparkle icon */}
      <svg
        className={cx(
          "relative z-10 transition-transform duration-300",
          size === "small" ? "h-3.5 w-3.5" : "h-4 w-4",
          isLoading ? "animate-spin" : "group-hover:rotate-12 group-hover:scale-110"
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        {isLoading ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
          />
        )}
      </svg>

      <span className="relative z-10">
        {isLoading ? "Generating..." : tooltipText}
      </span>
    </button>
  );
};
