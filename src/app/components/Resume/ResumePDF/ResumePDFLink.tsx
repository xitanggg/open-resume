import { Link } from "@react-pdf/renderer";

export const ResumePDFLink = ({
    src,
    isPDF,
    children,
  }: {
    src: string;
    isPDF: boolean;
    children: React.ReactNode;
  }) => {
    if (isPDF) {
      return (
        <Link src={src} style={{ textDecoration: "none" }}>
          {children}
        </Link>
      );
    }
    return (
      <a
        href={src}
        style={{ textDecoration: "none" }}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    );
  };