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
      <div className="min-h-0 dark:bg-gray-800 bg-white">
        {/* You can apply dark mode classes to the container */}
        {children}
      </div>
    </div>
  );
};
