import mammoth from "mammoth";

import type { TextItems } from "lib/parse-resume-from-pdf/types";

export const readDocx = async (fileUrl: string): Promise<TextItems> => {
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error("Unable to read the DOCX file.");
  }

  const arrayBuffer = await response.arrayBuffer();

  const result = await mammoth.extractRawText({
    arrayBuffer,
  });

  const lines = result.value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const textItems: TextItems = lines.map((line, index) => ({
    text: line,
    x: 0,
    y: -index,
    width: line.length,
    height: 12,
    fontName: "Arial",
    hasEOL: true,
  }));

  return textItems;
};