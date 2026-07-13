import { motion } from "framer-motion";
import { FiSun, FiMoon } from "react-icons/fi";
import { useThemeContext } from "../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useThemeContext();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={toggleTheme}
      className={`p-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10
                  dark:hover:bg-white/20 transition-colors ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? (
        <FiSun className="w-5 h-5 text-yellow-400" />
      ) : (
        <FiMoon className="w-5 h-5 text-indigo-600" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;
