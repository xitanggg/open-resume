import { useEffect, useState } from "react";

import ContentEditable from "react-contenteditable";

import { useAutosizeTextareaHeight } from "lib/hooks/useAutosizeTextareaHeight";

interface InputProps<
  K extends string,
  V extends string | string[]
> {
  label: string;
  labelClassName?: string;

  name: K;

  value?: V;

  placeholder: string;

  maxLength?: number;

  onChange: (name: K, value: V) => void;
}

export const InputGroupWrapper = ({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children?: React.ReactNode;
}) => (
  <label
    className={`text-base font-medium text-gray-700 ${className}`}
  >
    {label}

    {children}
  </label>
);

export const INPUT_CLASS_NAME =
  "mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 text-gray-900 shadow-sm outline-none font-normal text-base";

/**
 * Displays the current character count.
 */
const CharacterCount = ({
  value,
  maxLength,
}: {
  value: string;
  maxLength?: number;
}) => {
  if (maxLength === undefined) {
    return null;
  }

  return (
    <div className="text-right text-sm font-normal text-gray-500">
      {value.length} / {maxLength}
    </div>
  );
};

export const Input = <K extends string>({
  name,
  value = "",
  placeholder,
  maxLength,
  onChange,
  label,
  labelClassName,
}: InputProps<K, string>) => {
  return (
    <InputGroupWrapper
      label={label}
      className={labelClassName}
    >
      <input
        type="text"
        name={name}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) =>
          onChange(name, e.target.value)
        }
        className={INPUT_CLASS_NAME}
      />

      <CharacterCount
        value={value}
        maxLength={maxLength}
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
  maxLength,
  onChange,
}: InputProps<T, string>) => {
  const textareaRef =
    useAutosizeTextareaHeight({
      value,
    });

  return (
    <InputGroupWrapper
      label={label}
      className={wrapperClassName}
    >
      <textarea
        ref={textareaRef}
        name={name}
        className={`${INPUT_CLASS_NAME} resize-none overflow-hidden`}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(e) =>
          onChange(name, e.target.value)
        }
      />

      <CharacterCount
        value={value}
        maxLength={maxLength}
      />
    </InputGroupWrapper>
  );
};

export const BulletListTextarea = <
  T extends string
>(
  props: InputProps<T, string[]> & {
    showBulletPoints?: boolean;
  }
) => {
  const [showFallback, setShowFallback] =
    useState(false);

  useEffect(() => {
    const isFirefox =
      navigator.userAgent.includes(
        "Firefox"
      );

    const isSafari =
      navigator.userAgent.includes(
        "Safari"
      ) &&
      !navigator.userAgent.includes(
        "Chrome"
      );

    if (isFirefox || isSafari) {
      setShowFallback(true);
    }
  }, []);

  if (showFallback) {
    return (
      <BulletListTextareaFallback
        {...props}
      />
    );
  }

  return (
    <BulletListTextareaGeneral
      {...props}
    />
  );
};

const BulletListTextareaGeneral = <
  T extends string
>({
  label,
  labelClassName: wrapperClassName,
  name,
  value: bulletListStrings = [],
  placeholder,
  onChange,
  showBulletPoints = true,
  maxLength,
}: InputProps<T, string[]> & {
  showBulletPoints?: boolean;
}) => {
  const html =
    getHTMLFromBulletListStrings(
      bulletListStrings
    );

  const characterCount =
    bulletListStrings.join("\n").length;

  return (
    <InputGroupWrapper
      label={label}
      className={wrapperClassName}
    >
      <ContentEditable
        contentEditable={true}
        className={`${INPUT_CLASS_NAME} cursor-text [&>div]:list-item ${
          showBulletPoints
            ? "pl-7"
            : "[&>div]:list-['']"
        }`}
        placeholder={placeholder}
        onChange={(e) => {
          if (e.type === "input") {
            const { innerText } =
              e.currentTarget as HTMLDivElement;

            const limitedText =
              maxLength !== undefined
                ? innerText.slice(
                    0,
                    maxLength
                  )
                : innerText;

            const newBulletListStrings =
              getBulletListStringsFromInnerText(
                limitedText
              );

            onChange(
              name,
              newBulletListStrings
            );
          }
        }}
        html={html}
      />

      {maxLength !== undefined && (
        <div className="text-right text-sm font-normal text-gray-500">
          {characterCount} / {maxLength}
        </div>
      )}
    </InputGroupWrapper>
  );
};

const NORMALIZED_LINE_BREAK = "\n";

const normalizeLineBreak = (
  str: string
) =>
  str.replace(
    /\r?\n/g,
    NORMALIZED_LINE_BREAK
  );

const dedupeLineBreak = (
  str: string
) =>
  str.replace(
    /\n\n/g,
    NORMALIZED_LINE_BREAK
  );

const getStringsByLineBreak = (
  str: string
) =>
  str.split(
    NORMALIZED_LINE_BREAK
  );

const getBulletListStringsFromInnerText = (
  innerText: string
) => {
  const innerTextWithNormalizedLineBreak =
    normalizeLineBreak(innerText);

  let newInnerText =
    dedupeLineBreak(
      innerTextWithNormalizedLineBreak
    );

  if (
    newInnerText ===
    NORMALIZED_LINE_BREAK
  ) {
    newInnerText = "";
  }

  return getStringsByLineBreak(
    newInnerText
  );
};

const getHTMLFromBulletListStrings = (
  bulletListStrings: string[]
) => {
  if (
    bulletListStrings.length === 0
  ) {
    return "<div></div>";
  }

  return bulletListStrings
    .map(
      (text) =>
        `<div>${text}</div>`
    )
    .join("");
};

const BulletListTextareaFallback = <
  T extends string
>({
  label,
  labelClassName,
  name,
  value: bulletListStrings = [],
  placeholder,
  onChange,
  showBulletPoints = true,
  maxLength,
}: InputProps<T, string[]> & {
  showBulletPoints?: boolean;
}) => {
  const textareaValue =
    getTextareaValueFromBulletListStrings(
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
      maxLength={maxLength}
      onChange={(name, value) => {
        onChange(
          name,
          getBulletListStringsFromTextareaValue(
            value,
            showBulletPoints
          )
        );
      }}
    />
  );
};

const getTextareaValueFromBulletListStrings = (
  bulletListStrings: string[],
  showBulletPoints: boolean
) => {
  const prefix = showBulletPoints
    ? "• "
    : "";

  if (
    bulletListStrings.length === 0
  ) {
    return prefix;
  }

  let value = "";

  for (
    let i = 0;
    i < bulletListStrings.length;
    i++
  ) {
    const string =
      bulletListStrings[i];

    const isLastItem =
      i ===
      bulletListStrings.length - 1;

    value += `${prefix}${string}${
      isLastItem
        ? ""
        : "\r\n"
    }`;
  }

  return value;
};

const getBulletListStringsFromTextareaValue = (
  textareaValue: string,
  showBulletPoints: boolean
) => {
  const textareaValueWithNormalizedLineBreak =
    normalizeLineBreak(
      textareaValue
    );

  const strings =
    getStringsByLineBreak(
      textareaValueWithNormalizedLineBreak
    );

  if (showBulletPoints) {
    const nonEmptyStrings =
      strings.filter(
        (s) => s !== "•"
      );

    const newStrings: string[] =
      [];

    for (const string of nonEmptyStrings) {
      if (
        string.startsWith("• ")
      ) {
        newStrings.push(
          string.slice(2)
        );
      } else if (
        string.startsWith("•")
      ) {
        const lastItemIdx =
          newStrings.length - 1;

        if (lastItemIdx >= 0) {
          const lastItem =
            newStrings[
              lastItemIdx
            ];

          newStrings[
            lastItemIdx
          ] =
            `${lastItem}${string.slice(
              1
            )}`;
        } else {
          newStrings.push(
            string.slice(1)
          );
        }
      } else {
        newStrings.push(string);
      }
    }

    return newStrings;
  }

  return strings;
};