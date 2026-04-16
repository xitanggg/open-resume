import { useState, useEffect, useRef } from "react";
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

  return (
    <InputGroupWrapper label={label} className={wrapperClassName}>
      <textarea
        ref={textareaRef}
        name={name}
        className={`${INPUT_CLASS_NAME} resize-none overflow-hidden`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
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
 * Uses a native contentEditable div controlled via a ref so that the DOM is only
 * updated when the value changes from outside (e.g. loaded from localStorage) and
 * NOT on every user keystroke. This prevents the cursor from jumping on backspace.
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
  const divRef = useRef<HTMLDivElement>(null);
  // Tracks the stringified value we last wrote into the DOM so we can distinguish
  // user edits (no DOM update needed) from external changes (DOM must be refreshed).
  const lastWrittenJsonRef = useRef<string | null>(null);

  // Set initial HTML content on mount only.
  useEffect(() => {
    if (divRef.current) {
      divRef.current.innerHTML = getHTMLFromBulletListStrings(bulletListStrings);
      lastWrittenJsonRef.current = JSON.stringify(bulletListStrings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync when the value changes externally (e.g. import / localStorage load),
  // but skip the update when the change originated from the user typing.
  useEffect(() => {
    const incoming = JSON.stringify(bulletListStrings);
    if (incoming !== lastWrittenJsonRef.current && divRef.current) {
      divRef.current.innerHTML = getHTMLFromBulletListStrings(bulletListStrings);
      lastWrittenJsonRef.current = incoming;
    }
  }, [bulletListStrings]);

  const handleInput = () => {
    if (!divRef.current) return;
    const newStrings = getBulletListStringsFromInnerText(
      divRef.current.innerText
    );
    // Record what we're about to propagate so the effect above won't reset the DOM.
    lastWrittenJsonRef.current = JSON.stringify(newStrings);
    onChange(name, newStrings);
  };

  return (
    <InputGroupWrapper label={label} className={wrapperClassName}>
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className={`${INPUT_CLASS_NAME} cursor-text [&>div]:list-item ${
          showBulletPoints ? "pl-7" : "[&>div]:list-['']"
        }`}
        onInput={handleInput}
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

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const getHTMLFromBulletListStrings = (bulletListStrings: string[]) => {
  // If bulletListStrings is an empty array, make it an empty div
  if (bulletListStrings.length === 0) {
    return "<div></div>";
  }

  return bulletListStrings
    .map((text) => `<div>${escapeHtml(text)}</div>`)
    .join("");
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

  return (
    <Textarea
      label={label}
      labelClassName={labelClassName}
      name={name}
      value={textareaValue}
      placeholder={placeholder}
      onChange={(name, value) => {
        onChange(
          name,
          getBulletListStringsFromTextareaValue(value, showBulletPoints)
        );
      }}
    />
  );
};

const getTextareaValueFromBulletListStrings = (
  bulletListStrings: string[],
  showBulletPoints: boolean
) => {
  const prefix = showBulletPoints ? "• " : "";

  if (bulletListStrings.length === 0) {
    return prefix;
  }

  let value = "";
  for (let i = 0; i < bulletListStrings.length; i++) {
    const string = bulletListStrings[i];
    const isLastItem = i === bulletListStrings.length - 1;
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
