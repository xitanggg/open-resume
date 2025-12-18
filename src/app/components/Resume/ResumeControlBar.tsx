"use client";
import { useEffect, useRef } from "react";
import { useSetDefaultScale } from "components/Resume/hooks";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { usePDF } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { Resume } from "lib/redux/types";
import { Settings } from "lib/redux/settingsSlice";

const ResumeControlBar = ({
  scale,
  setScale,
  documentSize,
  document,
  fileName,
  resume,
  setResume,
  settings,
  setSettings,
}: {


  scale: number;
  setScale: (scale: number) => void;
  documentSize: string;
  document: JSX.Element;
  fileName: string;
  resume: Resume;
  setResume: (resume: Resume) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
}) => {
  const { scaleOnResize, setScaleOnResize } = useSetDefaultScale({
    setScale,
    documentSize,
  });

  const [instance, update] = usePDF({ document });

  // Hook to update pdf when document changes
  useEffect(() => {
    update();
  }, [update, document]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.resume && json.settings) {
          setResume(json.resume);
          setSettings(json.settings);
        } else {
          setResume(json);
        }
      } catch (error) {
        console.error("Failed to parse resume JSON:", error);
      }
    };

    reader.readAsText(file);
    // Reset input so the same file can be selected again if needed
    event.target.value = "";
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 flex h-[var(--resume-control-bar-height)] items-center justify-between px-[var(--resume-padding)] bg-white/90 backdrop-blur-sm border-t border-gray-200 text-gray-600 z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.01}
            value={scale}
            className="h-1 w-24 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600 hover:bg-gray-300"
            onChange={(e) => {
              setScaleOnResize(false);
              setScale(Number(e.target.value));
            }}
          />
          <div className="w-12 text-sm font-medium">{`${Math.round(scale * 100)}%`}</div>
        </div>
        <label className="hidden items-center gap-1.5 lg:flex cursor-pointer select-none text-sm text-gray-500 hover:text-gray-900">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={scaleOnResize}
            onChange={() => setScaleOnResize((prev) => !prev)}
          />
          <span>Autoscale</span>
        </label>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <a
          className="ml-1 flex items-center gap-1 rounded-md border border-gray-300 px-3 py-0.5 hover:bg-gray-100 lg:ml-8"
          href={instance.url!}
          download={fileName}
          title="Download PDF"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span className="whitespace-nowrap">Download Resume</span>
        </a>

        <a
          className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-0.5 hover:bg-gray-100"
          href={`data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify({ resume, settings }, null, 2)
          )}`}
          download={`${fileName}.json`}
          title="Download Config"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span className="whitespace-nowrap">Config</span>
        </a>

        <label className="flex cursor-pointer items-center gap-1 rounded-md border border-gray-300 px-3 py-0.5 hover:bg-gray-100" title="Import Config">
          <ArrowUpTrayIcon className="h-4 w-4" />
          <span className="whitespace-nowrap">Import Config</span>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".json"
            onChange={handleImport}
          />
        </label>
      </div>
    </div>
  );
};

/**
 * Load ResumeControlBar client side since it uses usePDF, which is a web specific API
 */
export const ResumeControlBarCSR = dynamic(
  () => Promise.resolve(ResumeControlBar),
  {
    ssr: false,
  }
);

export const ResumeControlBarBorder = () => (
  <div className="absolute bottom-[var(--resume-control-bar-height)] w-full border-t-2 bg-gray-50" />
);
