import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    // Initialize state based on localStorage or fallback
    return localStorage.getItem("theme") === "dark" || 
           (!localStorage.getItem("theme") && document.documentElement.classList.contains("dark"));
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const toggleTheme = () => {
    setDark((prev) => !prev);
  };

  return (
    <div 
      onClick={toggleTheme}
      className={`relative w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        dark ? 'bg-blue-600' : 'bg-slate-300'
      }`}
      aria-label="Toggle Dark Mode"
    >
      <div 
        className={`bg-white w-5 h-5 rounded-full shadow-md flex items-center justify-center transform transition-transform duration-300 ${
          dark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {dark ? (
          <Moon size={12} className="text-blue-600" />
        ) : (
          <Sun size={12} className="text-yellow-500" />
        )}
      </div>
    </div>
  );
}

export default ThemeToggle;