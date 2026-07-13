import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-spotify-green flex items-center justify-center text-black font-bold text-sm">
          {user?.username?.[0]?.toUpperCase() || "U"}
        </div>
        <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
          {user?.username}
        </span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-spotify-gray rounded-xl shadow-xl border border-gray-200 dark:border-white/10 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-white/10">
                <p className="font-semibold truncate">{user?.username}</p>
                <p className="text-gray-500 dark:text-spotify-light text-sm truncate">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <FiUser className="w-4 h-4" />
                Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <FiSettings className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-red-500 dark:text-red-400"
              >
                <FiLogOut className="w-4 h-4" />
                Log out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
