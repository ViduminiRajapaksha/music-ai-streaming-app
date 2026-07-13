import { motion } from "framer-motion";
import { FiPlay, FiPause, FiTrash2 } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { usePlayer } from "../hooks/usePlayer";
import { useMusic } from "../hooks/useMusic";
import { formatDuration } from "../utils/formatDuration";
import { PLACEHOLDER_IMAGE } from "../utils/constants";

const FavoriteCard = ({ favorite, index = 0, queue = [] }) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const { toggleFavorite } = useMusic();

  const trackId = favorite.youtubeId || favorite.id;
  const isCurrent = currentTrack?.youtubeId === trackId;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(favorite, queue.length ? queue : [favorite]);
    }
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    await toggleFavorite(favorite);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 group cursor-pointer"
      onClick={handlePlay}
    >
      <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
        <img
          src={favorite.image || PLACEHOLDER_IMAGE}
          alt={favorite.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          {isCurrent && isPlaying ? (
            <FiPause className="w-4 h-4" />
          ) : (
            <FiPlay className="w-4 h-4 ml-0.5" />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isCurrent ? "text-spotify-green" : ""}`}>
          {favorite.title}
        </p>
        <p className="text-spotify-light text-sm truncate">{favorite.artist}</p>
      </div>
      <span className="text-spotify-light text-sm hidden sm:block">
        {formatDuration(favorite.durationMs)}
      </span>
      <motion.button
        whileTap={{ scale: 1.2 }}
        onClick={handleRemove}
        className="p-2 text-spotify-light hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
        aria-label="Remove favorite"
      >
        <FaHeart className="w-4 h-4 text-spotify-green" />
      </motion.button>
      <button
        onClick={handleRemove}
        className="p-2 text-spotify-light hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all sm:hidden"
        aria-label="Remove"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default FavoriteCard;
