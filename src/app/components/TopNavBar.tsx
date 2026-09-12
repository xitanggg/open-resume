"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logoSrc from "public/logo.svg";
import { cx } from "lib/cx";
import { AISettingsModal } from "components/AI/AISettingsModal";

export const TopNavBar = () => {
  const pathName = usePathname();
  const isHomePage = pathName === "/";
  const isBuilderPage = pathName === "/resume-builder";
  const [showAISettings, setShowAISettings] = useState(false);

  return (
    <>
      <header
        aria-label="Site Header"
        className={cx(
          "flex h-[var(--top-nav-bar-height)] items-center border-b-2 border-gray-100 px-3 lg:px-12",
          isHomePage && "bg-dot"
        )}
      >
        <div className="flex h-10 w-full items-center justify-between">
          <Link href="/">
            <span className="sr-only">OpenResume</span>
            <Image
              src={logoSrc}
              alt="OpenResume Logo"
              className="h-8 w-full"
              priority
            />
          </Link>
          <nav
            aria-label="Site Nav Bar"
            className="flex items-center gap-2 text-sm font-medium"
          >
            {[
              ["/resume-builder", "Builder"],
              ["/resume-parser", "Parser"],
            ].map(([href, text]) => (
              <Link
                key={text}
                className="rounded-md px-1.5 py-2 text-gray-500 hover:bg-gray-100 focus-visible:bg-gray-100 lg:px-4"
                href={href}
              >
                {text}
              </Link>
            ))}
            {/* AI Settings Button — visible on builder page */}
            {isBuilderPage && (
              <button
                onClick={() => setShowAISettings(true)}
                className="group relative ml-1 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md hover:from-violet-600 hover:to-purple-700 animate-ai-sparkle-pulse"
                title="AI Settings"
              >
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-90"
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
                AI Settings
              </button>
            )}
            <div className="ml-1 mt-1">
              <iframe
                src="https://ghbtns.com/github-btn.html?user=xitanggg&repo=open-resume&type=star&count=true"
                width="100"
                height="20"
                className="overflow-hidden border-none"
                title="GitHub"
              />
            </div>
          </nav>
        </div>
      </header>
      <AISettingsModal
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
      />
    </>
  );
};
