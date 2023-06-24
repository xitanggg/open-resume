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

/**
 * BulletListTextarea is a textarea where each new line starts with a bullet point.
 *
 * In its core, it uses a div with contentEditable set to True. However, when
 * contentEditable is True, user can paste in any arbitrary html and it would
 * render. So to make it behaves like a textarea, it strips down all html while
 * keeping only the text part.
 *
 * Reference: https://stackoverflow.com/a/74998090/7699841
 */
export const BulletListTextarea = <T extends string>({
  label,
  labelClassName: wrapperClassName,
  name,
  value: bulletListStrings = [],
  placeholder,
  onChange,
  showBulletPoints = true,
}: InputProps<T, string[]> & { showBulletPoints?: boolean }) => {
  const html = getHTMLFromBulletListStrings(bulletListStrings);

  return (
    <InputGroupWrapper label={label} className={wrapperClassName}>
      <ContentEditable
        contentEditable={true}
        className={`${INPUT_CLASS_NAME} cursor-text [&>div]:list-item ${
          showBulletPoints ? "pl-7" : "[&>div]:list-['']"
        }`}
        // Note: placeholder currently doesn't work
        placeholder={placeholder}
        onChange={(e) => {
          if (e.type === "input") {
            const { innerText } = e.currentTarget;
            const newBulletListStrings =
              getBulletListStringsFromInnerText(innerText);
            onChange(name, newBulletListStrings);
          }
        }}
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
    return "<div></div>";
  }

  return bulletListStrings.map((text) => `<div>${text}</div>`).join("");
};
