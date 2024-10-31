"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../contexts/ThemeContext"; // Import useTheme

export const Tooltip = ({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme(); // Access the dark mode state

  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [show, setShow] = useState(false);

  const showTooltip = () => setShow(true);
  const hideTooltip = () => setShow(false);

  useEffect(() => {
    const span = spanRef.current;
    const tooltip = tooltipRef.current;
    if (span && tooltip) {
      const rect = span.getBoundingClientRect();
      const TOP_OFFSET = 6;
      const newTop = rect.top + rect.height + TOP_OFFSET;
      const newLeft = rect.left - tooltip.offsetWidth / 2 + rect.width / 2;
      setTooltipPos({
        top: newTop,
        left: newLeft,
      });
    }
  }, [show]);

  return (
    <span
      ref={spanRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onClick={hideTooltip}
    >
      {children}
      {show &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className={`absolute left-0 top-0 z-10 w-max rounded-md px-2 py-0.5 text-sm ${
              isDarkMode ? "bg-gray-600 text-white" : "bg-gray-200 text-black"
            }`} // Toggle dark mode classes based on state
            style={{
              left: `${tooltipPos.left}px`,
              top: `${tooltipPos.top}px`,
            }}
          >
            {text}
          </div>,
          document.body
        )}
    </span>
  );
};
