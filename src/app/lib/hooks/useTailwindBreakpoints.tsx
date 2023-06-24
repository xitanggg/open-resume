import { useEffect, useState } from "react";

const enum TailwindBreakpoint {
  sm = 640,
  md = 768,
  lg = 1024,
  xl = 1280,
  "2xl" = 1536,
}

export const useTailwindBreakpoints = () => {
  const [isSm, setIsSm] = useState(false);
  const [isMd, setIsMd] = useState(false);
  const [isLg, setIsLg] = useState(false);
  const [isXl, setIsXl] = useState(false);
  const [is2xl, setIs2xl] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      setIsSm(screenWidth >= TailwindBreakpoint.sm);
      setIsMd(screenWidth >= TailwindBreakpoint.md);
      setIsLg(screenWidth >= TailwindBreakpoint.lg);
      setIsXl(screenWidth >= TailwindBreakpoint.xl);
      setIs2xl(screenWidth >= TailwindBreakpoint["2xl"]);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isSm, isMd, isLg, isXl, is2xl };
};
