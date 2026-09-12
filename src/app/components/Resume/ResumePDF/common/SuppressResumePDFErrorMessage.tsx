"use client";

/**
 * Suppress ResumePDF development errors.
 * See ResumePDF doc string for context.
 */
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  const consoleError = console.error;
  const SUPPRESSED_WARNINGS = ["DOCUMENT", "PAGE", "TEXT", "VIEW", "Invalid", "string child"];
  console.error = function filterWarnings(msg, ...args) {
    const msgStr = typeof msg === "string" ? msg : "";
    const argsStr = args[0] ? String(args[0]) : "";
    if (
      !SUPPRESSED_WARNINGS.some(
        (entry) => msgStr.includes(entry) || argsStr.includes(entry)
      )
    ) {
      consoleError(msg, ...args);
    }
  };
}

export const SuppressResumePDFErrorMessage = () => {
  return <></>;
};
