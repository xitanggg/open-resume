import { cx } from "lib/cx";

export const Link = ({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <a
      href={href}
      target="_blank"
      className={cx(
        "underline underline-offset-2 hover:decoration-2",
        className
      )}
    >
      {children}
    </a>
  );
};
