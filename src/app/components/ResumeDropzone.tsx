import { useState } from "react";

import { LockClosedIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { parseResumeFromPdf } from "lib/parse-resume-from-pdf";
import { parseResumeFromDocx } from "lib/parse-resume-from-docx";

import {
  getHasUsedAppBefore,
  saveStateToLocalStorage,
} from "lib/redux/local-storage";

import { type ShowForm, initialSettings } from "lib/redux/settingsSlice";

import { useRouter } from "next/navigation";

import addPdfSrc from "public/assets/add-pdf.svg";
import Image from "next/image";

import { cx } from "lib/cx";
import { deepClone } from "lib/deep-clone";

const defaultFileState = {
  name: "",
  size: 0,
  fileUrl: "",
};

export const ResumeDropzone = ({
  onFileUrlChange,
  className,
  playgroundView = false,
}: {
  onFileUrlChange: (fileUrl: string) => void;
  className?: string;
  playgroundView?: boolean;
}) => {
  const [file, setFile] = useState(defaultFileState);
  const [isHoveredOnDropzone, setIsHoveredOnDropzone] = useState(false);
  const [hasUnsupportedFile, setHasUnsupportedFile] = useState(false);

  const router = useRouter();

  const hasFile = Boolean(file.name);

  const setNewFile = (newFile: File) => {
    if (file.fileUrl) {
      URL.revokeObjectURL(file.fileUrl);
    }

    const { name, size } = newFile;
    const fileUrl = URL.createObjectURL(newFile);

    setFile({ name, size, fileUrl });
    onFileUrlChange(fileUrl);
  };

  const isSupportedFile = (newFile: File) => {
    const fileName = newFile.name.toLowerCase();

    return fileName.endsWith(".pdf") || fileName.endsWith(".docx");
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const newFile = event.dataTransfer.files[0];

    if (!newFile) {
      setIsHoveredOnDropzone(false);
      return;
    }

    if (isSupportedFile(newFile)) {
      setHasUnsupportedFile(false);
      setNewFile(newFile);
    } else {
      setHasUnsupportedFile(true);
    }

    setIsHoveredOnDropzone(false);
  };

  const onInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    const newFile = files[0];

    if (isSupportedFile(newFile)) {
      setHasUnsupportedFile(false);
      setNewFile(newFile);
    } else {
      setHasUnsupportedFile(true);
    }

    // Allow selecting the same file again after removing/rejecting it.
    event.target.value = "";
  };

  const onRemove = () => {
    if (file.fileUrl) {
      URL.revokeObjectURL(file.fileUrl);
    }

    setFile(defaultFileState);
    setHasUnsupportedFile(false);
    onFileUrlChange("");
  };

  const onImportClick = async () => {
    const fileName = file.name.toLowerCase();

    let resume;

    if (fileName.endsWith(".pdf")) {
      resume = await parseResumeFromPdf(file.fileUrl);
    } else if (fileName.endsWith(".docx")) {
      resume = await parseResumeFromDocx(file.fileUrl);
    } else {
      return;
    }

    const settings = deepClone(initialSettings);

    // Set formToShow settings based on uploaded resume
    // if users have used the app before
    if (getHasUsedAppBefore()) {
      const sections = Object.keys(settings.formToShow) as ShowForm[];

      const sectionToFormToShow: Record<ShowForm, boolean> = {
        workExperiences: resume.workExperiences.length > 0,
        educations: resume.educations.length > 0,
        projects: resume.projects.length > 0,
        skills: resume.skills.descriptions.length > 0,
        custom: resume.custom.descriptions.length > 0,
      };

      for (const section of sections) {
        settings.formToShow[section] = sectionToFormToShow[section];
      }
    }

    saveStateToLocalStorage({ resume, settings });
    router.push("/resume-builder");
  };

  return (
    <div
      className={cx(
        "flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 ",
        isHoveredOnDropzone && "border-sky-400",
        playgroundView ? "pb-6 pt-4" : "py-12",
        className
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setIsHoveredOnDropzone(true);
      }}
      onDragLeave={() => setIsHoveredOnDropzone(false)}
      onDrop={onDrop}
    >
      <div
        className={cx(
          "text-center",
          playgroundView ? "space-y-2" : "space-y-3"
        )}
      >
        {!playgroundView && (
          <Image
            src={addPdfSrc}
            className="mx-auto h-14 w-14"
            alt="Add PDF or DOCX"
            aria-hidden="true"
            priority
          />
        )}

        {!hasFile ? (
          <>
            <p
              className={cx(
                "pt-3 text-gray-700",
                !playgroundView && "text-lg font-semibold"
              )}
            >
              Browse a PDF or DOCX file or drop it here
            </p>

            <p className="flex text-sm text-gray-500">
              <LockClosedIcon className="mr-1 mt-1 h-3 w-3 text-gray-400" />
              File data is used locally and never leaves your browser
            </p>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3 pt-3">
            <div className="pl-7 font-semibold text-gray-900">
              {file.name} - {getFileSizeString(file.size)}
            </div>

            <button
              type="button"
              className="outline-theme-blue rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              title="Remove file"
              onClick={onRemove}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        )}

        <div className="pt-4">
          {!hasFile ? (
            <>
              <label
                className={cx(
                  "within-outline-theme-purple cursor-pointer rounded-full px-6 pb-2.5 pt-2 font-semibold shadow-sm",
                  playgroundView ? "border" : "bg-primary"
                )}
              >
                Browse file

                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.docx"
                  onChange={onInputChange}
                />
              </label>

              {hasUnsupportedFile && (
                <p className="mt-6 text-red-400">
                  Only PDF and DOCX files are supported
                </p>
              )}
            </>
          ) : (
            <>
              {!playgroundView && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={onImportClick}
                >
                  Import and Continue{" "}
                  <span aria-hidden="true">→</span>
                </button>
              )}

              <p
                className={cx(
                  "text-gray-500",
                  !playgroundView && "mt-6"
                )}
              >
                Note: {!playgroundView ? "Import" : "Parser"} works best on
                single column resume
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const getFileSizeString = (fileSizeB: number) => {
  const fileSizeKB = fileSizeB / 1024;
  const fileSizeMB = fileSizeKB / 1024;

  if (fileSizeKB < 1000) {
    return fileSizeKB.toPrecision(3) + " KB";
  } else {
    return fileSizeMB.toPrecision(3) + " MB";
  }
};