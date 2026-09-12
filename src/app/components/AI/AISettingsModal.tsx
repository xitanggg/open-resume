"use client";
import { useState, useEffect, useRef } from "react";
import { cx } from "lib/cx";
import {
  getAISettings,
  saveAISettings,
  type AISettings,
} from "lib/ai/ai-service";

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettingsModal = ({ isOpen, onClose }: AISettingsModalProps) => {
  const [settings, setSettings] = useState<AISettings>({
    apiKey: "",
    model: "gemini-3.5-flash-lite",
    tone: "professional",
  });
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(getAISettings());
      setSaved(false);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleSave = () => {
    saveAISettings(settings);
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-ai-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-2xl border border-purple-100 bg-white shadow-2xl shadow-purple-200/30 animate-ai-slide-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
              <svg
                className="h-4 w-4 text-white"
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
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">AI Settings</h2>
              <p className="text-xs text-gray-500">
                Configure your AI assistant
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              className="h-5 w-5"
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

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* API Key */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={settings.apiKey}
                onChange={(e) =>
                  setSettings({ ...settings, apiKey: e.target.value })
                }
                placeholder="AIza..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm text-gray-900 outline-none transition-all focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
              >
                {showKey ? (
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
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
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
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              🆓 Get your FREE key at{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-500 underline hover:text-purple-600"
              >
                aistudio.google.com
              </a>
              . Stored locally, never sent to our servers.
            </p>
          </div>

          {/* Model */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Model
            </label>
            <select
              value={settings.model}
              onChange={(e) =>
                setSettings({ ...settings, model: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            >
              <option value="gemini-3.5-flash-lite">
                Gemini 3.5 Flash Lite (15 RPM · Best Free)
              </option>
              <option value="gemini-3.1-flash-lite">
                Gemini 3.1 Flash Lite (15 RPM · Free)
              </option>
              <option value="gemini-3.5-flash">
                Gemini 3.5 Flash (5 RPM · Free)
              </option>
              <option value="gemini-3.6-flash">
                Gemini 3.6 Flash (5 RPM · Latest)
              </option>
              <option value="gemini-2.5-flash">
                Gemini 2.5 Flash (5 RPM · Free)
              </option>
            </select>
          </div>

          {/* Tone */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Writing Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "professional", label: "Professional", icon: "💼" },
                  { value: "creative", label: "Creative", icon: "🎨" },
                  { value: "academic", label: "Academic", icon: "🎓" },
                ] as const
              ).map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSettings({ ...settings, tone: value })}
                  className={cx(
                    "flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all",
                    settings.tone === value
                      ? "border-purple-400 bg-purple-50 text-purple-700 shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <span className="text-lg">{icon}</span>
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={cx(
              "inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all",
              saved
                ? "bg-green-500"
                : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 hover:shadow-md"
            )}
          >
            {saved ? (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                Saved!
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
