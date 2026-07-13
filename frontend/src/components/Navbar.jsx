import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import ProfileDropdown from "./ProfileDropdown";
import ThemeToggle from "./ThemeToggle";
import { FiMenu } from "react-icons/fi";

const Navbar = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-spotify-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
      <div className="flex items-center gap-4 px-4 md:px-6 h-16">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          <FiMenu className="w-6 h-6" />
        </button>

        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-lg hidden sm:block">MelodyMind</span>
        </Link>

        <div className="flex-1 max-w-xl mx-auto hidden sm:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
