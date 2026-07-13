import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";

const SearchBar = ({
  placeholder = "Search songs, artists, albums...",
  onSearch,
  className = "",
  autoFocus = false
}) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (onSearch) {
      onSearch(trimmed);
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`relative ${className}`}
      whileFocus={{ scale: 1.01 }}
    >
      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-spotify-light w-5 h-5" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-gray-100 dark:bg-spotify-gray text-gray-900 dark:text-white rounded-full pl-12 pr-4 py-3
                   placeholder-gray-500 dark:placeholder-spotify-light focus:outline-none focus:ring-2
                   focus:ring-spotify-green/50 transition-all"
      />
    </motion.form>
  );
};

export default SearchBar;
