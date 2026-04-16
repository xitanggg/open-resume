"use client";
import { useState, useEffect, useMemo } from "react";
import { readPdf } from "lib/parse-resume-from-pdf/read-pdf";
import type { TextItems } from "lib/parse-resume-from-pdf/types";
import { groupTextItemsIntoLines } from "lib/parse-resume-from-pdf/group-text-items-into-lines";
import { groupLinesIntoSections } from "lib/parse-resume-from-pdf/group-lines-into-sections";
import { extractResumeFromSections } from "lib/parse-resume-from-pdf/extract-resume-from-sections";
import { ResumeDropzone } from "components/ResumeDropzone";
import { cx } from "lib/cx";
import { PrimaryButton } from "components/Button";
import { Heading, Link, Paragraph } from "components/documentation";
import { ResumeTable } from "resume-parser/ResumeTable";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { saveParsedResumeToBuilderState } from "lib/redux/parsed-resume-to-builder-state";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ResumeParserAlgorithmArticle = dynamic(
  () =>
    import("resume-parser/ResumeParserAlgorithmArticle").then(
      (mod) => mod.ResumeParserAlgorithmArticle
    ),
  {
    loading: () => (
      <p className="mt-4 text-sm text-gray-500">Loading parser deep dive...</p>
    ),
  }
);

const PDFBoundingBoxOverlay = dynamic(
  () =>
    import("resume-parser/PDFBoundingBoxOverlay").then(
      (mod) => mod.PDFBoundingBoxOverlay
    ),
  { ssr: false }
);

const RESUME_EXAMPLES = [
  {
    fileUrl: "resume-example/laverne-resume.pdf",
    description: (
      <span>
        Borrowed from University of La Verne Career Center -{" "}
        <Link href="https://laverne.edu/careers/wp-content/uploads/sites/15/2010/12/Undergraduate-Student-Resume-Examples.pdf">
          Link
        </Link>
      </span>
    ),
  },
  {
    fileUrl: "resume-example/openresume-resume.pdf",
    description: (
      <span>
        Created with OpenResume resume builder -{" "}
        <Link href="/resume-builder">Link</Link>
      </span>
    ),
  },
];

const defaultFileUrl = RESUME_EXAMPLES[0]["fileUrl"];

export default function ResumeParser() {
  const [fileUrl, setFileUrl] = useState(defaultFileUrl);
  const [textItems, setTextItems] = useState<TextItems>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [hasParsedResume, setHasParsedResume] = useState(false);
  const [parseError, setParseError] = useState("");
  const [isLoadingInBuilder, setIsLoadingInBuilder] = useState(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(false);
  const [loadInBuilderError, setLoadInBuilderError] = useState("");
  const router = useRouter();

  const lines = useMemo(() => groupTextItemsIntoLines(textItems || []), [textItems]);
  const sections = useMemo(() => groupLinesIntoSections(lines), [lines]);
  const resume = useMemo(() => extractResumeFromSections(sections), [sections]);
  const canLoadInBuilder = hasParsedResume && !isParsing;

  useEffect(() => {
    let isCurrent = true;
    const abortController = new AbortController();

    async function parsePdfIntoTextItems() {
      if (!fileUrl) {
        setTextItems([]);
        setHasParsedResume(false);
        setParseError("");
        setIsParsing(false);
        return;
      }

      setTextItems([]);
      setHasParsedResume(false);
      setParseError("");
      setIsParsing(true);
      try {
        const parsedTextItems = await readPdf(fileUrl, {
          signal: abortController.signal,
        });
        if (isCurrent) {
          setTextItems(parsedTextItems);
          setHasParsedResume(true);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        if (isCurrent) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to parse the selected PDF file.";
          setParseError(message);
          setTextItems([]);
          setHasParsedResume(false);
        }
      } finally {
        if (isCurrent) {
          setIsParsing(false);
        }
      }
    }

    parsePdfIntoTextItems();

    return () => {
      isCurrent = false;
      abortController.abort();
    };
  }, [fileUrl]);

  const onLoadInBuilderClick = async () => {
    if (!canLoadInBuilder || isLoadingInBuilder) return;

    setLoadInBuilderError("");
    setIsLoadingInBuilder(true);
    try {
      saveParsedResumeToBuilderState(resume, { enableSmartLayout: true });
      router.push("/resume-builder");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load parsed resume in builder.";
      setLoadInBuilderError(message);
    } finally {
      setIsLoadingInBuilder(false);
    }
  };

  return (
    <main className="h-full w-full overflow-hidden">
      <div className="grid md:grid-cols-6">
        <div className="flex justify-center px-2 md:col-span-3 md:h-[calc(100vh-var(--top-nav-bar-height))] md:justify-end">
          <section className="mt-5 grow px-4 md:max-w-[600px] md:px-0">
            <div className="aspect-h-[9.5] aspect-w-7 relative">
              {fileUrl ? (
                <>
                  <object
                    data={fileUrl}
                    type="application/pdf"
                    className="h-full w-full"
                  >
                    <p>Your browser does not support inline PDFs.</p>
                  </object>
                  {showBoundingBoxes && (
                    <PDFBoundingBoxOverlay
                      textItems={textItems}
                      lines={lines}
                      sections={sections}
                      showTextItems={true}
                      showLines={true}
                      showSections={true}
                    />
                  )}
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-gray-300 bg-white px-6 text-center text-sm text-gray-500">
                  Select a resume example below or upload your own PDF to parse.
                </div>
              )}
            </div>
          </section>
          <FlexboxSpacer maxWidth={45} className="hidden md:block" />
        </div>
        <div className="flex px-6 text-gray-900 md:col-span-3 md:h-[calc(100vh-var(--top-nav-bar-height))] md:overflow-y-scroll">
          <FlexboxSpacer maxWidth={45} className="hidden md:block" />
          <section className="max-w-[600px] grow">
            <Heading className="text-primary !mt-4">
              Resume Parser Playground
            </Heading>
            <Paragraph smallMarginTop={true}>
              This playground showcases the OpenResume resume parser and its
              ability to parse information from a resume PDF. Click around the
              PDF examples below to observe different parsing results.
            </Paragraph>
            <div className="mt-3 flex gap-3">
              {RESUME_EXAMPLES.map((example, idx) => (
                <article
                  key={idx}
                  className={cx(
                    "flex-1 cursor-pointer rounded-md border-2 px-4 py-3 shadow-sm outline-none hover:bg-gray-50 focus:bg-gray-50",
                    example.fileUrl === fileUrl
                      ? "border-blue-400"
                      : "border-gray-300"
                  )}
                  onClick={() => setFileUrl(example.fileUrl)}
                  onKeyDown={(e) => {
                    if (["Enter", " "].includes(e.key))
                      setFileUrl(example.fileUrl);
                  }}
                  tabIndex={0}
                >
                  <h1 className="font-semibold">Resume Example {idx + 1}</h1>
                  <p className="mt-2 text-sm text-gray-500">
                    {example.description}
                  </p>
                </article>
              ))}
            </div>
            <Paragraph>
              You can also{" "}
              <span className="font-semibold">add your resume below</span> to
              access how well your resume would be parsed by similar Application
              Tracking Systems (ATS) used in job applications. The more
              information it can parse out, the better it indicates the resume
              is well formatted and easy to read. It is beneficial to have the
              name and email accurately parsed at the very least.
            </Paragraph>
            <div className="mt-3">
              <ResumeDropzone
                onFileUrlChange={(nextFileUrl) => {
                  setLoadInBuilderError("");
                  setFileUrl(nextFileUrl);
                }}
                playgroundView={true}
              />
            </div>
            <div className="mt-4 flex gap-3">
              <PrimaryButton
                className={cx("disabled:cursor-not-allowed disabled:opacity-60")}
                disabled={!canLoadInBuilder || isLoadingInBuilder}
                onClick={onLoadInBuilderClick}
              >
                {isLoadingInBuilder
                  ? "Loading parsed info in builder..."
                  : "Load Parsed Info in Builder"}
                <span aria-hidden="true">→</span>
              </PrimaryButton>
              <button
                type="button"
                className="btn-outline"
                disabled={!canLoadInBuilder || isLoadingInBuilder}
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              >
                {showBoundingBoxes ? "Hide" : "Show"} Bounding Boxes
              </button>
            </div>
            {canLoadInBuilder && (
              <p className="mt-2 text-sm text-gray-500">
                Continue in the builder with smart section visibility and order
                based on parsed content. Or toggle bounding boxes to see what the parser "sees".
              </p>
            )}
            {isParsing && (
                <p className="mt-1 text-sm text-gray-500" role="status" aria-live="polite">
                  Parsing your PDF...
                </p>
              )}
              {parseError && (
                <p className="mt-2 text-sm text-red-500" role="alert">{parseError}</p>
              )}
              {loadInBuilderError && (
                <p className="mt-2 text-sm text-red-500" role="alert">{loadInBuilderError}</p>
              )}
            <Heading level={2} className="!mt-[1.2em]">
              Resume Parsing Results
            </Heading>
            <ResumeTable resume={resume} />
            {hasParsedResume && (
              <ResumeParserAlgorithmArticle
                textItems={textItems}
                lines={lines}
                sections={sections}
              />
            )}
            <div className="pt-24" />
          </section>
        </div>
      </div>
    </main>
  );
}
