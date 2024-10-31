import "globals.css";
import { TopNavBar } from "components/TopNavBar";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "contexts/ThemeContext"; // Import ThemeProvider

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-gray-900 text-black dark:text-white">
        <ThemeProvider>
          <TopNavBar />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
