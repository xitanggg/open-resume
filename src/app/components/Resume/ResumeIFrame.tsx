"use client";
import { useEffect, useMemo, useState } from "react";
import Frame, { useFrame } from "react-frame-component";
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  A4_WIDTH_PT,
  LETTER_HEIGHT_PX,
  LETTER_WIDTH_PX,
  LETTER_WIDTH_PT,
} from "lib/constants";
import dynamic from "next/dynamic";
import { getAllFontFamiliesToLoad } from "components/fonts/lib";

const getIframeInitialContent = (isA4: boolean) => {
  const width = isA4 ? A4_WIDTH_PT : LETTER_WIDTH_PT;
  const allFontFamilies = getAllFontFamiliesToLoad();

  const allFontFamiliesPreloadLinks = allFontFamilies
    .map(
      (
        font
      ) => `<link rel="preload" as="font" href="/fonts/${font}-Regular.ttf" type="font/ttf" crossorigin="anonymous">
<link rel="preload" as="font" href="/fonts/${font}-Bold.ttf" type="font/ttf" crossorigin="anonymous">`
    )
    .join("");

  const allFontFamiliesFontFaces = allFontFamilies
    .map(
      (
        font
      ) => `@font-face {font-family: "${font}"; src: url("/fonts/${font}-Regular.ttf");}
@font-face {font-family: "${font}"; src: url("/fonts/${font}-Bold.ttf"); font-weight: bold;}`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
  <head>
    ${allFontFamiliesPreloadLinks}
    <style>
      ${allFontFamiliesFontFaces}
    </style>
  </head>
  <body style='overflow: hidden; width: ${width}pt; margin: 0; padding: 0; -webkit-text-size-adjust:none;'>
    <div></div>
  </body>
</html>`;
};

/**
 * Rendered inside the iframe. Watches the iframe body's height and reports
 * how many pages the resume content spans.
 */
const PageCountReporter = ({
  pageHeight,
  onPageCountChange,
}: {
  pageHeight: number;
  onPageCountChange: (pageCount: number) => void;
}) => {
  const { document: frameDocument, window: frameWindow } = useFrame();

  useEffect(() => {
    const body = frameDocument?.body;
    if (!body) return;
    const update = () =>
      onPageCountChange(
        Math.max(1, Math.ceil(body.scrollHeight / pageHeight))
      );
    update();
    const Observer =
      (frameWindow as (Window & typeof globalThis) | undefined)
        ?.ResizeObserver ?? ResizeObserver;
    const observer = new Observer(update);
    observer.observe(body);
    return () => observer.disconnect();
  }, [frameDocument, frameWindow, pageHeight, onPageCountChange]);

  return null;
};

/**
 * Iframe is used here for style isolation, since react pdf uses pt unit.
 * It creates a sandbox document body that uses letter/A4 pt size as width.
 *
 * With multiPage, the iframe grows by one page height whenever the content
 * overflows, and dashed lines mark where each page ends.
 */
const ResumeIframe = ({
  documentSize,
  scale,
  children,
  enablePDFViewer = false,
  multiPage = false,
}: {
  documentSize: string;
  scale: number;
  children: React.ReactNode;
  enablePDFViewer?: boolean;
  multiPage?: boolean;
}) => {
  const isA4 = documentSize === "A4";
  const iframeInitialContent = useMemo(
    () => getIframeInitialContent(isA4),
    [isA4]
  );
  const [pageCount, setPageCount] = useState(1);

  if (enablePDFViewer) {
    return (
      <DynamicPDFViewer className="h-full w-full">
        {children as any}
      </DynamicPDFViewer>
    );
  }
  const width = isA4 ? A4_WIDTH_PX : LETTER_WIDTH_PX;
  const pageHeight = isA4 ? A4_HEIGHT_PX : LETTER_HEIGHT_PX;
  const shownPages = multiPage ? pageCount : 1;
  const height = pageHeight * shownPages;

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
        className={`relative origin-top-left bg-white shadow-lg`}
      >
        <Frame
          style={{ width: "100%", height: "100%" }}
          initialContent={iframeInitialContent}
          // key is used to force component to re-mount when document size changes
          key={isA4 ? "A4" : "LETTER"}
        >
          {children}
          {multiPage && (
            <PageCountReporter
              pageHeight={pageHeight}
              onPageCountChange={setPageCount}
            />
          )}
        </Frame>
        {/* Dashed lines marking page breaks */}
        {Array.from({ length: shownPages - 1 }, (_, i) => (
          <div
            key={i}
            className="pointer-events-none absolute left-0 right-0 border-t-2 border-dashed border-gray-300"
            style={{ top: `${pageHeight * (i + 1)}px` }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Load iframe client side since iframe can't be SSR
 */
export const ResumeIframeCSR = dynamic(() => Promise.resolve(ResumeIframe), {
  ssr: false,
});

// PDFViewer is only used for debugging. Its size is quite large, so we make it dynamic import
const DynamicPDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((module) => module.PDFViewer),
  {
    ssr: false,
  }
);
