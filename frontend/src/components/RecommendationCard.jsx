import { motion } from "framer-motion";
import { FiPlay } from "react-icons/fi";
import { usePlayer } from "../hooks/usePlayer";
import { normalizeYouTubeTrack } from "../utils/normalize";
import { PLACEHOLDER_IMAGE } from "../utils/constants";

const sourceStyles = {
  gemini: "bg-purple-500/20 text-purple-200",
  youtube: "bg-blue-500/20 text-blue-200",
  local: "bg-spotify-green/20 text-spotify-green",
  history: "bg-amber-500/20 text-amber-200",
  fallback: "bg-yellow-500/20 text-yellow-200"
};

const RecommendationCard = ({ track, reason, sourceLabel = "", sourceType = "local", index = 0, queue = [] }) => {
  const { playTrack } = usePlayer();

  const normalized = track.youtubeId
    ? track
    : normalizeYouTubeTrack(track) || {
        id: track.youtubeId,
        youtubeId: track.youtubeId,
        title: track.title,
        artist: track.artist,
        image: track.album?.images?.[0]?.url || track.thumbnails?.high?.url || PLACEHOLDER_IMAGE,
        previewUrl: track.preview_url || track.previewUrl || "",
        durationMs: track.duration_ms || track.durationMs || 0
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl p-4 card-hover group"
    >
      <div className="flex gap-4">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={normalized.image || PLACEHOLDER_IMAGE}
            alt={normalized.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => playTrack(normalized, queue.length ? queue : [normalized])}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                       flex items-center justify-center transition-opacity"
            aria-label="Play"
          >
            <FiPlay className="w-5 h-5 ml-0.5" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-semibold truncate">{normalized.title}</h4>
            {sourceLabel && (
              <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${sourceStyles[sourceType] || sourceStyles.local}`}>
                {sourceLabel}
              </span>
            )}
          </div>
          <p className="text-spotify-light text-sm truncate">{normalized.artist}</p>
          {reason && (
            <p className="text-spotify-green/80 text-xs mt-2 line-clamp-2">{reason}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationCard;
