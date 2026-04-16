"use client";
import type { TextItems, Lines, ResumeSectionToLines } from "lib/parse-resume-from-pdf/types";

// Standard PDF points to pixels ratio (pdf.js typically uses CSS points where 1pt = 1px by default,
// but the actual rendering scale depends on the container. We define view box matching standard letter size points)
const LETTER_WIDTH_PT = 612;
const LETTER_HEIGHT_PT = 792;

export const PDFBoundingBoxOverlay = ({
  textItems,
  lines,
  sections,
  showTextItems,
  showLines,
  showSections,
}: {
  textItems: TextItems;
  lines: Lines;
  sections: ResumeSectionToLines;
  showTextItems: boolean;
  showLines: boolean;
  showSections: boolean;
}) => {
  if (!textItems.length) return null;

  // Render individual text item boxes (Blue)
  const renderTextItemBoxes = () => {
    return textItems.map((item, idx) => (
      <rect
        key={`text-${idx}`}
        x={item.x}
        // y in pdf.js is from bottom-up, but SVGs are top-down. 
        // read-pdf.ts actually reverses it to top-down in `readPdf` 
        y={item.y}
        width={item.width}
        height={item.height}
        fill="rgba(56, 189, 248, 0.2)"
        stroke="rgba(56, 189, 248, 0.8)"
        strokeWidth="1"
      />
    ));
  };

  // Render line boxes (Green)
  const renderLineBoxes = () => {
    return lines.map((line, idx) => {
      if (!line.length) return null;
      const minX = Math.min(...line.map((item) => item.x));
      const minY = Math.min(...line.map((item) => item.y));
      const maxX = Math.max(...line.map((item) => item.x + item.width));
      const maxY = Math.max(...line.map((item) => item.y + item.height));

      return (
        <rect
          key={`line-${idx}`}
          x={minX}
          y={minY}
          width={maxX - minX}
          height={maxY - minY}
          fill="none"
          stroke="rgba(34, 197, 94, 0.8)"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
      );
    });
  };

  // Render section boxes (Red/Pink with labels)
  const renderSectionBoxes = () => {
    return Object.entries(sections).map(([sectionName, sectionLines], idx) => {
      if (!sectionLines || !sectionLines.length) return null;
      
      const flatItems = sectionLines.flat();
      if (!flatItems.length) return null;

      const minX = Math.min(...flatItems.map((item) => item.x));
      const minY = Math.min(...flatItems.map((item) => item.y));
      const maxX = Math.max(...flatItems.map((item) => item.x + item.width));
      const maxY = Math.max(...flatItems.map((item) => item.y + item.height));

      return (
        <g key={`section-${idx}`}>
          <rect
            x={minX - 2}
            y={minY - 2}
            width={maxX - minX + 4}
            height={maxY - minY + 4}
            fill="rgba(244, 63, 94, 0.05)"
            stroke="rgba(244, 63, 94, 0.9)"
            strokeWidth="2"
          />
          <text
            x={minX}
            y={minY - 4}
            fontSize="10"
            fill="rgba(244, 63, 94, 1)"
            fontWeight="bold"
            className="uppercase"
          >
            {sectionName}
          </text>
        </g>
      );
    });
  };

  return (
    <svg
      viewBox={`0 0 ${LETTER_WIDTH_PT} ${LETTER_HEIGHT_PT}`}
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {showTextItems && renderTextItemBoxes()}
      {showLines && renderLineBoxes()}
      {showSections && renderSectionBoxes()}
    </svg>
  );
};
