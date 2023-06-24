import { useEffect, useRef } from "react";

/**
 * Hook to autosize textarea height.
 *
 * The trick to resize is to first set its height to 0 and then set it back to scroll height.
 * Reference: https://stackoverflow.com/a/25621277/7699841
 *
 * @example // Tailwind CSS
 * const textareaRef = useAutosizeTextareaHeight({ value });
 * <textarea ref={textareaRef} className="resize-none overflow-hidden"/>
 */
export const useAutosizeTextareaHeight = ({ value }: { value: string }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "0px";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Resize height when value changes
  useEffect(() => {
    resizeHeight();
  }, [value]);

  // Resize height when viewport resizes
  useEffect(() => {
    window.addEventListener("resize", resizeHeight);
    return () => window.removeEventListener("resize", resizeHeight);
  }, []);

  return textareaRef;
};
