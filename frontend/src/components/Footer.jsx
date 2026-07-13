const Footer = () => {
  return (
    <footer className="hidden md:block px-6 py-4 border-t border-gray-200 dark:border-white/5 text-center transition-colors duration-300">
      <p className="text-gray-500 dark:text-spotify-light text-xs">
        © {new Date().getFullYear()} MelodyMind AI — Music Streaming Platform
      </p>
    </footer>
  );
};

export default Footer;
