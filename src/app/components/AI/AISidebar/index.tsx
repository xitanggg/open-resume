"use client";
import { useState, useCallback } from "react";
import { cx } from "lib/cx";
import { useAppSelector } from "lib/redux/hooks";
import { selectResume } from "lib/redux/resumeSlice";
import { AIAssistantTab } from "components/AI/AISidebar/AIAssistantTab";
import { ResumeReviewTab } from "components/AI/AISidebar/ResumeReviewTab";
import { JobMatchTab } from "components/AI/AISidebar/JobMatchTab";

type TabId = "assistant" | "review" | "job-match";

interface Tab {
  id: TabId;
  label: string;
  badge?: string;
}

const TABS: Tab[] = [
  { id: "assistant", label: "AI Assistant" },
  { id: "review", label: "Resume Review" },
  { id: "job-match", label: "Job Match" },
];

export const AISidebar = () => {
  const [activeTab, setActiveTab] = useState<TabId>("assistant");
  const resume = useAppSelector(selectResume);

  return (
    <div className="flex h-[calc(100vh-var(--top-nav-bar-height))] flex-col border-l border-gray-200 bg-white">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cx(
              "relative flex-1 px-2 py-3 text-xs font-semibold transition-all duration-200",
              activeTab === tab.id
                ? "text-sky-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
          >
            <span className="relative z-10">{tab.label}</span>
            {tab.badge && (
              <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white">
                {tab.badge}
              </span>
            )}
            {/* Active indicator */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {activeTab === "assistant" && <AIAssistantTab />}
        {activeTab === "review" && <ResumeReviewTab />}
        {activeTab === "job-match" && <JobMatchTab />}
      </div>
    </div>
  );
};
