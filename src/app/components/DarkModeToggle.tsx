"use client";
import { useTheme } from "../contexts/ThemeContext"; // Import the useTheme hook

const DarkModeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme(); // Get dark mode state and toggle function from context

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
