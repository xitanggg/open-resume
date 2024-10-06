"use client";
import { useEffect, useState } from "react";
import { useSetDefaultScale } from "components/Resume/hooks";
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { usePDF } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import createDocx from "./ResumeDocx"; // Import the createDocx function
import { useAppSelector } from "lib/redux/hooks"; // Import the hook to access Redux store
import { selectResume } from "lib/redux/resumeSlice"; // Import the selector to get resume data

const ResumeControlBar = ({
  scale,
  setScale,
  documentSize,
  document,
  fileName,
}: {
  scale: number;
  setScale: (scale: number) => void;
  documentSize: string;
  document: JSX.Element;
  fileName: string;
}) => {
  const { scaleOnResize, setScaleOnResize } = useSetDefaultScale({
    setScale,
    documentSize,
  });

  const [instance, update] = usePDF({ document });
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf");
  
  // Access the resume data from the Redux store
  const resume = useAppSelector(selectResume); // Get the current resume

  // Hook to update pdf when document changes
  useEffect(() => {
    update();
  }, [update, document]);

  // Function to trigger download based on selected format
  const handleDownload = async () => {
    if (selectedFormat === "pdf") {
      // PDF Download
      const link = window.document.createElement("a");
      link.href = instance.url!;
      link.download = fileName;
      link.click();
    } else if (selectedFormat === "docx") {
      // DOCX Download
      await createDocx(resume); // Call the createDocx function directly
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 flex h-[var(--resume-control-bar-height)] items-center justify-center px-[var(--resume-padding)] text-gray-600 lg:justify-between">
      <div className="flex items-center gap-2">
        <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.01}
          value={scale}
          onChange={(e) => {
            setScaleOnResize(false);
            setScale(Number(e.target.value));
          }}
        />
        <div className="w-9">{`${Math.round(scale * 100)}%`}</div>
        <label className="hidden items-center gap-2 lg:flex">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4"
            checked={scaleOnResize}
            onChange={() => setScaleOnResize((prev) => !prev)}
          />
          <span className="select-none">Autoscale</span>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <select
          className="border rounded-md p-1 ml-2"
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
        >
          <option value="pdf">Export to PDF</option>
          <option value="docx">Export to DOCX</option>
        </select>

        <button
          className="ml-1 flex items-center gap-1 rounded-md border border-gray-300 px-3 py-0.5 hover:bg-gray-100"
          onClick={handleDownload}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span className="whitespace-nowrap">Download Resume</span>
        </button>
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

export default ResumeControlBar; // Don't forget to export the component
