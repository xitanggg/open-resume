import { useCallback, useEffect, useState } from "react";
import { A4_HEIGHT_PX, LETTER_HEIGHT_PX } from "lib/constants";
import { getPxPerRem } from "lib/get-px-per-rem";
import { CSS_VARIABLES } from "globals-css";
import { loadStateFromLocalStorage } from "lib/redux/local-storage";

/**
 * useSetDefaultScale sets the default scale of the resume on load.
 *
 * It computes the scale based on current screen height and derives the default
 * resume height by subtracting the screen height from the total heights of top
 * nav bar, resume control bar, and resume top & bottom padding.
 */
export const useSetDefaultScale = ({
  setScale,
  documentSize,
}: {
  setScale: (scale: number) => void;
  documentSize: string;
}) => {
  const [scaleOnResize, setScaleOnResize] = useState(true);

  useEffect(() => {
    const getDefaultScale = () => {
      const screenHeightPx = window.innerHeight;
      const PX_PER_REM = getPxPerRem();
      const screenHeightRem = screenHeightPx / PX_PER_REM;
      const topNavBarHeightRem = parseFloat(
        CSS_VARIABLES["--top-nav-bar-height"]
      );
      const resumeControlBarHeight = parseFloat(
        CSS_VARIABLES["--resume-control-bar-height"]
      );
      const resumePadding = parseFloat(CSS_VARIABLES["--resume-padding"]);
      const topAndBottomResumePadding = resumePadding * 2;
      const defaultResumeHeightRem =
        screenHeightRem -
        topNavBarHeightRem -
        resumeControlBarHeight -
        topAndBottomResumePadding;
      const resumeHeightPx = defaultResumeHeightRem * PX_PER_REM;
      const height = documentSize === "A4" ? A4_HEIGHT_PX : LETTER_HEIGHT_PX;
      const defaultScale = Math.round((resumeHeightPx / height) * 100) / 100;
      return defaultScale;
    };

    const setDefaultScale = () => {
      const defaultScale = getDefaultScale();
      setScale(defaultScale);
    };

    if (scaleOnResize) {
      setDefaultScale();
      window.addEventListener("resize", setDefaultScale);
    }

    return () => {
      window.removeEventListener("resize", setDefaultScale);
    };
  }, [setScale, scaleOnResize, documentSize]);

  return { scaleOnResize, setScaleOnResize };
};

/**
 * useJSON is a hook to retrieve the document data from local storage
 * as a URL.
 *
 * It retrieves the document data from local storage and creates a URL to
 * download the document.
 */
export const useJSON = () => {
    const [url, setUrl] = useState<string | null>(null);

    const update = useCallback(() => {
        const state = loadStateFromLocalStorage();
        if (state) {
          const newBlob = new Blob([JSON.stringify(state)], {
            type: "application/pdf",
          });
          setUrl((prevUrl) => {
            // Revoke the previous URL to avoid memory leaks
            if (prevUrl) {
              URL.revokeObjectURL(prevUrl);
            }
            return URL.createObjectURL(newBlob);
          });
        }
      }, []);
  
    return { url, update };
};
