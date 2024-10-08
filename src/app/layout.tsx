import "globals.css";
import { TopNavBar } from "components/TopNavBar";
import { Analytics } from "@vercel/analytics/react";
import DarkModeToggle from "components/DarkModeToggle";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-gray-900 text-black dark:text-white">
        <TopNavBar />
        <div className="flex top-4 right-4 z-50">
          <DarkModeToggle /> {/* Positioning the button at the center */}
        </div>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
