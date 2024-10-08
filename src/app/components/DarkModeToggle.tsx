"use client";

import { useEffect, useState } from "react";

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // On initial load, set the theme based on user's preference
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark" || (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-md shadow-md hover:bg-gray-300 dark:hover:bg-gray-700 transition duration-300"
    >
      {isDarkMode ? (
        <>
          <span className="mr-2">🌞</span> 
        </>
      ) : (
        <>
          <span className="mr-2">🌙</span> 
        </>
      )}
    </button>
  );
};

export default DarkModeToggle;
