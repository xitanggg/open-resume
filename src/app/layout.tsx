import "globals.css";  // Make sure Tailwind CSS is being used
import { TopNavBar } from "components/TopNavBar";  // Your existing top navigation bar
import { Analytics } from "@vercel/analytics/react";  // Analytics setup
import DarkModeToggle from "components/DarkModeToggle";  // Import the dark mode toggle button

export const metadata = {
  title: "OpenResume - Free Open-source Resume Builder and Parser",
  description:
    "OpenResume is a free, open-source, and powerful resume builder that allows anyone to create a modern professional resume in 3 simple steps. For those who have an existing resume, OpenResume also provides a resume parser to help test and confirm its ATS readability.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-gray-900 text-black dark:text-white">  {/* Add Tailwind dark classes */}
        <TopNavBar />  {/* Your existing navigation */}
        <DarkModeToggle />  {/* Add the dark mode toggle button here */}
        {children}
        <Analytics />  {/* Analytics tracking */}
      </body>
    </html>
  );
}
