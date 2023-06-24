/**
 * ExpanderWithHeightTransition is a div wrapper with built-in transition animation based on height.
 * If expanded is true, it slowly expands its content and vice versa.
 *
 * Note: There is no easy way to animate height transition in CSS: https://github.com/w3c/csswg-drafts/issues/626.
 * This is a clever solution based on css grid and is borrowed from https://css-tricks.com/css-grid-can-do-auto-height-transitions/
 *
 */
export const ExpanderWithHeightTransition = ({
  expanded,
  children,
}: {
  expanded: boolean;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={`grid overflow-hidden transition-all duration-300 ${
        expanded ? "visible" : "invisible"
      }`}
      style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
    >
      <div className="min-h-0">{children}</div>
    </div>
  );
};
