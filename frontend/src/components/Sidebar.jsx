import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiSearch,
  FiHeart,
  FiMusic,
  FiTrendingUp,
  FiDisc,
  FiUsers,
  FiGrid,
  FiBookOpen,
  FiUploadCloud,
  FiStar,
  FiDownload,
  FiClock,
  FiHeadphones,
  FiList,
  FiFileText,
  FiShield,
  FiBarChart2,
  FiSettings,
  FiMessageCircle,
  FiZap,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiMic
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";

const CollapsibleSection = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="mb-2">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span>{title}</span>
      </div>
      {isOpen ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="pl-8 pr-2 py-1 space-y-1">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const SidebarLink = ({ to, icon: Icon, label, onClick, end = false }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
          : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
      }`
    }
  >
    <Icon className="w-4 h-4" />
    {label}
  </NavLink>
);

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    library: true,
    nowPlaying: false,
    ai: false,
    admin: false
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 lg:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center">
            <span className="text-black font-bold">M</span>
          </div>
          <span className="font-bold text-xl">MelodyMind</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
          aria-label="Close sidebar"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1 mb-4">
          <NavLink
            to="/"
            end
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`
            }
          >
            <FiHome className="w-5 h-5" />
            Home
          </NavLink>
          <NavLink
            to="/search"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`
            }
          >
            <FiSearch className="w-5 h-5" />
            Search
          </NavLink>
        </div>

        {/* Library Section */}
        <CollapsibleSection
          title="Library"
          icon={FiBookOpen}
          isOpen={expandedSections.library}
          onToggle={() => toggleSection("library")}
        >
          <NavLink
            to="/playlists"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`
            }
          >
            <FiMusic className="w-4 h-4" />
            Playlists
          </NavLink>
          <NavLink
            to="/favorites"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`
            }
          >
            <FiHeart className="w-4 h-4" />
            Favorites
          </NavLink>
          <NavLink
            to="/downloads"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`
            }
          >
            <FiDownload className="w-4 h-4" />
            Downloads
          </NavLink>
          <NavLink
            to="/history"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`
            }
          >
            <FiClock className="w-4 h-4" />
            History
          </NavLink>
        </CollapsibleSection>

        {/* Now Playing Section */}
        <CollapsibleSection
          title="Now Playing"
          icon={FiHeadphones}
          isOpen={expandedSections.nowPlaying}
          onToggle={() => toggleSection("nowPlaying")}
        >
          <NavLink
            to="/queue"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`
            }
          >
            <FiList className="w-4 h-4" />
            Queue
          </NavLink>
          <NavLink
            to="/lyrics"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`
            }
          >
            <FiFileText className="w-4 h-4" />
            Lyrics
          </NavLink>
        </CollapsibleSection>

        {/* AI Assistant Section */}
        <CollapsibleSection
          title="AI Assistant"
          icon={FiZap}
          isOpen={expandedSections.ai}
          onToggle={() => toggleSection("ai")}
        >
          <NavLink
            to="/ai-chat"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`
            }
          >
            <FiMessageCircle className="w-4 h-4" />
            AI Chat
          </NavLink>
          <NavLink
            to="/smart-search"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`
            }
          >
            <FiZap className="w-4 h-4" />
            Smart Search
          </NavLink>
          <NavLink
            to="/generate-playlist"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`
            }
          >
            <FiMusic className="w-4 h-4" />
            AI Playlist
          </NavLink>
          <NavLink
            to="/recommendations"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`
            }
          >
            <FiStar className="w-4 h-4" />
            Recommendations
          </NavLink>
          <NavLink
            to="/recommendation-history"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`
            }
          >
            <FiClock className="w-4 h-4" />
            AI History
          </NavLink>
        </CollapsibleSection>

        {/* Artist Studio */}
        {(user?.role === "artist" || user?.role === "admin") && (
          <div className="space-y-1 mb-4">
            <NavLink
              to="/artist-studio"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                }`
              }
            >
              <FiMic className="w-5 h-5" />
              Artist Studio
            </NavLink>
          </div>
        )}

        {/* Admin Section */}
        {user?.role === "admin" && (
          <CollapsibleSection
            title="Admin"
            icon={FiShield}
            isOpen={expandedSections.admin}
            onToggle={() => toggleSection("admin")}
          >
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                }`
              }
            >
              <FiBarChart2 className="w-4 h-4" />
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/users"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                }`
              }
            >
              <FiUsers className="w-4 h-4" />
              Users
            </NavLink>
            <NavLink
              to="/admin/artists"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                }`
              }
            >
              <FiUsers className="w-4 h-4" />
              Artists
            </NavLink>
            <NavLink
              to="/admin/songs"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                }`
              }
            >
              <FiMusic className="w-4 h-4" />
              Songs
            </NavLink>
            <NavLink
              to="/admin/albums"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                }`
              }
            >
              <FiDisc className="w-4 h-4" />
              Albums
            </NavLink>
            <NavLink
              to="/admin/analytics"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                }`
              }
            >
              <FiBarChart2 className="w-4 h-4" />
              Analytics
            </NavLink>
            <NavLink
              to="/admin/reports"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                }`
              }
            >
              <FiFileText className="w-4 h-4" />
              Reports
            </NavLink>
            <NavLink
              to="/admin/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-spotify-light hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                }`
              }
            >
              <FiSettings className="w-4 h-4" />
              Settings
            </NavLink>
          </CollapsibleSection>
        )}
      </nav>

      <div className="p-6 border-t border-gray-200 dark:border-white/5">
        <p className="text-gray-500 dark:text-spotify-light text-xs">
          Powered by YouTube & Gemini AI
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-white dark:bg-spotify-black border-r border-gray-200 dark:border-white/5 h-full transition-colors duration-300">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-spotify-black z-50 lg:hidden border-r border-gray-200 dark:border-white/5 transition-colors duration-300"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
