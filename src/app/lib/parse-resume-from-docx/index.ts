import { readDocx } from "lib/parse-resume-from-docx/read-docx";

import { groupTextItemsIntoLines } from "lib/parse-resume-from-pdf/group-text-items-into-lines";

import { groupLinesIntoSections } from "lib/parse-resume-from-pdf/group-lines-into-sections";

import { extractResumeFromSections } from "lib/parse-resume-from-pdf/extract-resume-from-sections";

/**
 * Resume parser util that parses a resume from a DOCX file.
 *
 * DOCX text is converted into the same text-item format
 * used by the existing PDF parser so that the existing
 * resume extraction pipeline can be reused.
 */
export const parseResumeFromDocx = async (fileUrl: string) => {
  // Step 1. Read DOCX resume into text items
  const textItems = await readDocx(fileUrl);

  // Step 2. Group text items into lines





























  
  const lines = groupTextItemsIntoLines(textItems);

  // Step 3. Group lines into sections
  const sections = groupLinesIntoSections(lines);

  // Step 4. Extract resume from sections
  const resume = extractResumeFromSections(sections);

  return resume;
};