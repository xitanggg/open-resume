export const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex rounded-md bg-blue-50 px-2 pb-0.5 align-text-bottom text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
    {children}
  </span>
);
