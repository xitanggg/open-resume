import { groupLinesIntoSections } from "lib/parse-resume-from-pdf/group-lines-into-sections";
import { groupTextItemsIntoLines } from "lib/parse-resume-from-pdf/group-text-items-into-lines";
import type { TextItem } from "lib/parse-resume-from-pdf/types";

const makeTextItem = (
  text: string,
  overrides: Partial<TextItem> = {}
): TextItem => ({
  text,
  x: 72,
  y: 720,
  width: text.length * 6,
  height: 12,
  fontName: "Arial",
  hasEOL: true,
  ...overrides,
});

describe("groupTextItemsIntoLines", () => {
  it("keeps a section heading on the next page from merging into the previous page line", () => {
    const lines = groupTextItemsIntoLines([
      makeTextItem("JANE DOE", { pageNumber: 1 }),
      makeTextItem("Summary line without explicit page-ending EOL", {
        hasEOL: false,
        pageNumber: 1,
      }),
      makeTextItem("EDUCATION", {
        fontName: "Arial-BoldMT",
        pageNumber: 2,
      }),
      makeTextItem("Example University", { pageNumber: 2 }),
    ]);

    expect(lines.map((line) => line.map((item) => item.text).join(""))).toEqual(
      [
        "JANE DOE",
        "Summary line without explicit page-ending EOL",
        "EDUCATION",
        "Example University",
      ]
    );

    const sections = groupLinesIntoSections(lines);
    expect(sections.EDUCATION?.[0][0].text).toBe("Example University");
  });
});
