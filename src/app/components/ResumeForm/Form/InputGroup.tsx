import { useState, useEffect } from "react";
import ContentEditable from "react-contenteditable";
import { useAutosizeTextareaHeight } from "lib/hooks/useAutosizeTextareaHeight";

interface InputProps<K extends string, V extends string | string[]> {
  label: string;
  labelClassName?: string;
  // name is passed in as a const string. Therefore, we make it a generic type so its type can
  // be more restricted as a const for the first argument in onChange
  name: K;
  value?: V;
  placeholder: string;
  onChange: (name: K, value: V) => void;
}

/**
 * InputGroupWrapper wraps a label element around a input children. This is preferable
 * than having input as a sibling since it makes clicking label auto focus input children
 */
export const InputGroupWrapper = ({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children?: React.ReactNode;
}) => (
  <label className={`text-base font-medium text-gray-700 ${className}`}>
    {label}
    {children}
  </label>
);

export const INPUT_CLASS_NAME =
  "mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 text-gray-900 shadow-sm outline-none font-normal text-base";

export const Input = <K extends string>({
  name,
  value = "",
  placeholder,
  onChange,
  label,
  labelClassName,
}: InputProps<K, string>) => {
  return (
    <InputGroupWrapper label={label} className={labelClassName}>
      <input
        type="text"
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        className={INPUT_CLASS_NAME}
      />
    </InputGroupWrapper>
  );
};

export const Textarea = <T extends string>({
  label,
  labelClassName: wrapperClassName,
  name,
  value = "",
  placeholder,
  onChange,
}: InputProps<T, string>) => {
  const textareaRef = useAutosizeTextareaHeight({ value });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();

      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = textarea.value;

      // Insert tab character at cursor position
      const newValue = currentValue.substring(0, start) + "\t" + currentValue.substring(end);

      // Update the value
      onChange(name, newValue);

      // Set cursor position after the inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  return (
    <InputGroupWrapper label={label} className={wrapperClassName}>
      <textarea
        ref={textareaRef}
        name={name}
        className={`${INPUT_CLASS_NAME} resize-none overflow-hidden whitespace-pre-wrap`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </InputGroupWrapper>
  );
};

export const BulletListTextarea = <T extends string>(
  props: InputProps<T, string[]> & { showBulletPoints?: boolean }
) => {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const isFirefox = navigator.userAgent.includes("Firefox");
    const isSafari =
      navigator.userAgent.includes("Safari") &&
      !navigator.userAgent.includes("Chrome"); // Note that Chrome also includes Safari in its userAgent
    if (isFirefox || isSafari) {
      setShowFallback(true);
    }
  }, []);

  if (showFallback) {
    return <BulletListTextareaFallback {...props} />;
  }
  return <BulletListTextareaGeneral {...props} />;
};

/**
 * BulletListTextareaGeneral is a textarea where each new line starts with a bullet point.
 *
 * In its core, it uses a div with contentEditable set to True. However, when
 * contentEditable is True, user can paste in any arbitrary html and it would
 * render. So to make it behaves like a textarea, it strips down all html while
 * keeping only the text part.
 *
 * Reference: https://stackoverflow.com/a/74998090/7699841
 */
const BulletListTextareaGeneral = <T extends string>({
  label,
  labelClassName: wrapperClassName,
  name,
  value: bulletListStrings = [],
  placeholder,
  onChange,
  showBulletPoints = true,
}: InputProps<T, string[]> & { showBulletPoints?: boolean }) => {
  const html = getHTMLFromBulletListStrings(bulletListStrings);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();

      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;

      const range = selection.getRangeAt(0);

      // Get the current line/div element
      let currentNode = range.startContainer;
      if (currentNode.nodeType === Node.TEXT_NODE) {
        currentNode = currentNode.parentNode as Node;
      }

      const listItem = (currentNode as HTMLElement).closest('div[contenteditable] > div');
      if (!listItem) return;

      const isShiftTab = e.shiftKey;
      const textContent = listItem.textContent || "";

      if (isShiftTab) {
        // Remove indent
        if (textContent.startsWith("\t")) {
          // Remove one tab from the start
          const newText = textContent.substring(1);
          listItem.textContent = newText || "";
          // Update class based on whether still indented
          if (newText.startsWith("\t")) {
            listItem.className = "no-bullet";
          } else {
            listItem.className = "bullet-item";
          }
        }
      } else {
        // Add indent - insert tab at the beginning
        const newText = "\t" + textContent;
        listItem.textContent = newText;
        // Update class to no-bullet
        listItem.className = "no-bullet";
      }

      // Trigger onChange event manually
      const event = new Event('input', { bubbles: true });
      (listItem.parentElement as HTMLElement)?.dispatchEvent(event);

      // Set cursor at the end of the line
      setTimeout(() => {
        const newRange = document.createRange();
        const textNode = listItem.firstChild;
        if (textNode) {
          const offset = textNode.textContent?.length || 0;
          newRange.setStart(textNode, offset);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }, 0);
    }
  };

  return (
    <InputGroupWrapper label={label} className={wrapperClassName}>
      <ContentEditable
        contentEditable={true}
        className={`${INPUT_CLASS_NAME} cursor-text ${
          showBulletPoints ? "pl-7 [&>div.bullet-item]:list-item [&>div.no-bullet]:list-none" : "[&>div]:list-['']"
        } whitespace-pre-wrap`}
        // Note: placeholder currently doesn't work
        placeholder={placeholder}
        onChange={(e) => {
          if (e.type === "input") {
            const { innerText } = e.currentTarget as HTMLDivElement;
            const newBulletListStrings =
              getBulletListStringsFromInnerText(innerText);
            onChange(name, newBulletListStrings);
          }
        }}
        onKeyDown={handleKeyDown}
        html={html}
      />
    </InputGroupWrapper>
  );
};

const NORMALIZED_LINE_BREAK = "\n";
/**
 * Normalize line breaks to be \n since different OS uses different line break
 *    Windows -> \r\n (CRLF)
 *    Unix    -> \n (LF)
 *    Mac     -> \n (LF), or \r (CR) for earlier versions
 */
const normalizeLineBreak = (str: string) =>
  str.replace(/\r?\n/g, NORMALIZED_LINE_BREAK);
const dedupeLineBreak = (str: string) =>
  str.replace(/\n\n/g, NORMALIZED_LINE_BREAK);
const getStringsByLineBreak = (str: string) => str.split(NORMALIZED_LINE_BREAK);

const getBulletListStringsFromInnerText = (innerText: string) => {
  const innerTextWithNormalizedLineBreak = normalizeLineBreak(innerText);

  // In Windows Chrome, pressing enter creates 2 line breaks "\n\n"
  // This dedupes it into 1 line break "\n"
  let newInnerText = dedupeLineBreak(innerTextWithNormalizedLineBreak);

  // Handle the special case when content is empty
  if (newInnerText === NORMALIZED_LINE_BREAK) {
    newInnerText = "";
  }

  return getStringsByLineBreak(newInnerText);
};

const getHTMLFromBulletListStrings = (bulletListStrings: string[]) => {
  // If bulletListStrings is an empty array, make it an empty div
  if (bulletListStrings.length === 0) {
    return "<div class='bullet-item'></div>";
  }

  return bulletListStrings.map((text) => {
    // Check if text starts with tab - if so, don't show bullet point
    const isIndented = text.startsWith("\t");
    const className = isIndented ? "no-bullet" : "bullet-item";
    return `<div class="${className}">${text}</div>`;
  }).join("");
};

/**
 * BulletListTextareaFallback is a fallback for BulletListTextareaGeneral to work around
 * content editable div issue in some browsers. For example, in Firefox, if user enters
 * space in the content editable div at the end of line, Firefox returns it as a new
 * line character \n instead of space in innerText.
 */
const BulletListTextareaFallback = <T extends string>({
  label,
  labelClassName,
  name,
  value: bulletListStrings = [],
  placeholder,
  onChange,
  showBulletPoints = true,
}: InputProps<T, string[]> & { showBulletPoints?: boolean }) => {
  const textareaValue = getTextareaValueFromBulletListStrings(
    bulletListStrings,
    showBulletPoints
  );
  const textareaRef = useAutosizeTextareaHeight({ value: textareaValue });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();

      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      if (e.shiftKey) {
        // Shift+Tab: Remove indent
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineText = value.substring(lineStart, start);

        if (lineText.endsWith('\t')) {
          const newValue = value.substring(0, start - 1) + value.substring(end);
          textarea.value = newValue;
          textarea.selectionStart = textarea.selectionEnd = start - 1;
        } else if (lineText.endsWith('  ')) {
          const newValue = value.substring(0, start - 2) + value.substring(end);
          textarea.value = newValue;
          textarea.selectionStart = textarea.selectionEnd = start - 2;
        }
      } else {
        // Tab: Add indent
        const newValue = value.substring(0, start) + '\t' + value.substring(end);
        textarea.value = newValue;
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }

      onChange(
        name,
        getBulletListStringsFromTextareaValue(textarea.value, showBulletPoints)
      );
    }
  };

  return (
    <InputGroupWrapper label={label} className={labelClassName}>
      <textarea
        ref={textareaRef}
        name={name}
        className={`${INPUT_CLASS_NAME} resize-none overflow-hidden whitespace-pre-wrap`}
        placeholder={placeholder}
        value={textareaValue}
        onChange={(e) => onChange(
          name,
          getBulletListStringsFromTextareaValue(e.target.value, showBulletPoints)
        )}
        onKeyDown={handleKeyDown}
      />
    </InputGroupWrapper>
  );
};

const getTextareaValueFromBulletListStrings = (
  bulletListStrings: string[],
  showBulletPoints: boolean
) => {
  if (bulletListStrings.length === 0) {
    return showBulletPoints ? "• " : "";
  }

  let value = "";
  for (let i = 0; i < bulletListStrings.length; i++) {
    const string = bulletListStrings[i];
    const isLastItem = i === bulletListStrings.length - 1;
    // Don't add bullet point if line starts with tab (indented)
    const prefix = (showBulletPoints && !string.startsWith("\t")) ? "• " : "";
    value += `${prefix}${string}${isLastItem ? "" : "\r\n"}`;
  }
  return value;
};

const getBulletListStringsFromTextareaValue = (
  textareaValue: string,
  showBulletPoints: boolean
) => {
  const textareaValueWithNormalizedLineBreak =
    normalizeLineBreak(textareaValue);

  const strings = getStringsByLineBreak(textareaValueWithNormalizedLineBreak);

  if (showBulletPoints) {
    // Filter out empty strings
    const nonEmptyStrings = strings.filter((s) => s !== "•");

    let newStrings: string[] = [];
    for (let string of nonEmptyStrings) {
      if (string.startsWith("• ")) {
        newStrings.push(string.slice(2));
      } else if (string.startsWith("•")) {
        // Handle the special case when user wants to delete the bullet point, in which case
        // we combine it with the previous line if previous line exists
        const lastItemIdx = newStrings.length - 1;
        if (lastItemIdx >= 0) {
          const lastItem = newStrings[lastItemIdx];
          newStrings[lastItemIdx] = `${lastItem}${string.slice(1)}`;
        } else {
          newStrings.push(string.slice(1));
        }
      } else {
        newStrings.push(string);
      }
    }
    return newStrings;
  }

  return strings;
};
