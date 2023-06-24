"use client";
import { FONT_FAMILIES } from "public/fonts/fonts";
import Frame from "react-frame-component";
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  LETTER_HEIGHT_PX,
  LETTER_WIDTH_PT,
  LETTER_WIDTH_PX,
} from "lib/constants";
import dynamic from "next/dynamic";

const IFRAME_INITIAL_CONTENT_FONT_FAMILIES_PRELOAD_LINKS = FONT_FAMILIES.map(
  (
    font
  ) => `<link rel="preload" as="font" href="/fonts/${font}-Regular.ttf" type="font/ttf" crossorigin="anonymous">
  <link rel="preload" as="font" href="/fonts/${font}-Bold.ttf" type="font/ttf" crossorigin="anonymous">`
).join("");

const IFRAME_INITIAL_CONTENT_FONT_FAMILIES_FONT_FACE = FONT_FAMILIES.map(
  (
    font
  ) => `@font-face {font-family: "${font}"; src: url("/fonts/${font}-Regular.ttf");}
  @font-face {font-family: "${font}"; src: url("/fonts/${font}-Bold.ttf"); font-weight: bold;}`
).join("");

const IFRAME_INITIAL_CONTENT = `<!DOCTYPE html>
    <html>
      <head>
        ${IFRAME_INITIAL_CONTENT_FONT_FAMILIES_PRELOAD_LINKS}
        <style>
          ${IFRAME_INITIAL_CONTENT_FONT_FAMILIES_FONT_FACE}
        </style>
      </head>
      <body style='overflow: hidden; width: ${LETTER_WIDTH_PT}pt; margin: 0; padding: 0; -webkit-text-size-adjust:none;'>
        <div></div>
      </body>
    </html>`;

/**
 * IFrame is used here for style isolation, since react pdf uses pt unit.
 * It creates a sandbox document body that uses letter/A4 size as width.
 */
const ResumeIFrameComponent = ({
  documentSize,
  scale,
  children,
  enablePDFViewer = false,
}: {
  documentSize: string;
  scale: number;
  children: React.ReactNode;
  enablePDFViewer?: boolean;
}) => {
  if (enablePDFViewer) {
    return (
      <DynamicPDFViewer className="h-full w-full">
        {children as any}
      </DynamicPDFViewer>
    );
  }
  const width = documentSize === "A4" ? A4_WIDTH_PX : LETTER_WIDTH_PX;
  const height = documentSize === "A4" ? A4_HEIGHT_PX : LETTER_HEIGHT_PX;

  return (
    <div
      style={{
        maxWidth: `${width * scale}px`,
        maxHeight: `${height * scale}px`,
      }}
    >
      {/* There is an outer div and an inner div here. The inner div sets the iframe width and uses transform scale to zoom in/out the resume iframe.
        While zooming out or scaling down via transform, the element appears smaller but still occupies the same width/height. Therefore, we use the 
        outer div to restrict the max width & height proportionally */}
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${scale})`,
        }}
        className={`origin-top-left bg-white shadow-lg`}
      >
        <Frame
          style={{ width: "100%", height: "100%" }}
          initialContent={IFRAME_INITIAL_CONTENT}
        >
          {children}
        </Frame>
      </div>
    </div>
  );
};

// Iframe can't be server side rendered, so we use dynamic import to load it only on client side
export const ResumeIFrame = dynamic(
  () => Promise.resolve(ResumeIFrameComponent),
  {
    ssr: false,
  }
);

// PDFViewer is only used for debugging. Its size is quite large, so we make it dynamic import
const DynamicPDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((module) => module.PDFViewer),
  {
    ssr: false,
  }
);
