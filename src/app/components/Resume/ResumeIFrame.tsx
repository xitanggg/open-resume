"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import Frame, { FrameContextConsumer } from "react-frame-component";
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
 * Component to measure content height inside the iframe
 */
const ContentMeasurer = ({ 
  onHeightChange, 
  children 
}: { 
  onHeightChange: (height: number) => void;
  children: React.ReactNode;
}) => {
  return (
    <FrameContextConsumer>
      {({ document }) => {
        // Set up a mutation observer to detect content changes
        if (document?.body) {
          const checkHeight = () => {
            const height = document.body.scrollHeight;
            onHeightChange(height);
          };
          
          // Check height on next tick and periodically
          setTimeout(checkHeight, 50);
          setTimeout(checkHeight, 200);
          setTimeout(checkHeight, 500);
        }
        return children;
      }}
    </FrameContextConsumer>
  );
};

/**
 * Iframe is used here for style isolation, since react pdf uses pt unit.
 * It creates a sandbox document body that uses letter/A4 pt size as width.
 */
const ResumeIframe = ({
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
  const isA4 = documentSize === "A4";
  const width = isA4 ? A4_WIDTH_PX : LETTER_WIDTH_PX;
  const height = isA4 ? A4_HEIGHT_PX : LETTER_HEIGHT_PX;
  
  const [contentHeight, setContentHeight] = useState(height);
  const numPages = Math.max(1, Math.ceil(contentHeight / height));

  const handleHeightChange = useCallback((newHeight: number) => {
    setContentHeight(prev => Math.max(prev, newHeight));
  }, []);

  const iframeInitialContent = useMemo(
    () => getIframeInitialContent(isA4),
    [isA4]
  );

  if (enablePDFViewer) {
    return (
      <DynamicPDFViewer className="h-full w-full">
        {children as any}
      </DynamicPDFViewer>
    );
  }

  // Calculate total height needed for all pages plus gaps
  const pageGap = 16; // 16px gap between pages
  const totalHeight = (numPages * height + (numPages - 1) * pageGap) * scale;

  return (
    <div className="h-full overflow-auto bg-gray-200">
      <div 
        className="flex flex-col items-center py-4"
        style={{ minHeight: `${totalHeight + 32}px` }}
      >
        {Array.from({ length: numPages }, (_, pageIndex) => (
          <div
            key={pageIndex}
            style={{
              width: `${width * scale}px`,
              height: `${height * scale}px`,
              marginBottom: pageIndex < numPages - 1 ? `${pageGap}px` : 0,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: `${width}px`,
                height: `${height}px`,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                overflow: "hidden",
              }}
              className="bg-white shadow-lg rounded-sm"
            >
              <div style={{ marginTop: `-${pageIndex * height}px` }}>
                <Frame
                  style={{ 
                    width: "100%", 
                    height: `${height * numPages}px`,
                    border: "none",
                  }}
                  initialContent={iframeInitialContent}
                  key={`${isA4 ? "A4" : "LETTER"}-page-${pageIndex}-${numPages}`}
                >
                  <ContentMeasurer onHeightChange={handleHeightChange}>
                    {children}
                  </ContentMeasurer>
                </Frame>
              </div>
            </div>
          </div>
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
