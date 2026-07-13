import { motion } from "framer-motion";
import { FiPlay, FiHeart, FiPause } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { usePlayer } from "../hooks/usePlayer";
import { useMusic } from "../hooks/useMusic";
import { formatDuration } from "../utils/formatDuration";
import { PLACEHOLDER_IMAGE } from "../utils/constants";

const MusicCard = ({ track, index = 0, showPlay = true, queue = [] }) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const { isFavorite, toggleFavorite } = useMusic();

  const trackId = track.youtubeId || track.id;
  const isCurrent = currentTrack?.youtubeId === trackId;
  const isFav = isFavorite(trackId);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queue.length ? queue : [track]);
    }
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(track);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-gray-100 dark:bg-spotify-dark/50 p-4 rounded-xl card-hover cursor-pointer"
      onClick={handlePlay}
    >
      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-lg">
        <img
          src={track.image || PLACEHOLDER_IMAGE}
          alt={track.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {showPlay && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.1 }}
            className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full
                       flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100
                       transition-opacity duration-200"
            onClick={handlePlay}
            aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
          >
            {isCurrent && isPlaying ? (
              <FiPause className="w-5 h-5 text-black" />
            ) : (
              <FiPlay className="w-5 h-5 text-black ml-0.5" />
            )}
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 1.3 }}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/50 opacity-0
                     group-hover:opacity-100 transition-opacity"
          onClick={handleFavorite}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          {isFav ? (
            <FaHeart className="w-4 h-4 text-spotify-green" />
          ) : (
            <FiHeart className="w-4 h-4 text-white" />
          )}
        </motion.button>
      </div>
      <h3 className="font-semibold truncate text-sm">{track.title}</h3>
      <p className="text-gray-500 dark:text-spotify-light text-xs truncate mt-1">{track.artist}</p>
      {track.durationMs > 0 && (
        <p className="text-gray-400 dark:text-spotify-light text-xs mt-1">{formatDuration(track.durationMs)}</p>
      )}
    </motion.div>
  );
};

export default MusicCard;
