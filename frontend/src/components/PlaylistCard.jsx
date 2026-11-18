import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMusic, FiPlay } from "react-icons/fi";

const PlaylistCard = ({ playlist, index = 0 }) => {
  const navigate = useNavigate();
  const songCount = playlist.songs?.length || 0;
  const covers = (playlist.songs || []).filter((song) => song.image).slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group cursor-pointer rounded-lg bg-white/[0.04] p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.08]"
      onClick={() => navigate(`/playlists/${playlist._id}`)}
    >
      <div className="relative mb-4 aspect-square overflow-hidden rounded-md bg-gradient-to-br from-spotify-green/20 via-spotify-gray to-black shadow-lg">
        {covers.length > 1 ? (
          <div className="grid h-full w-full grid-cols-2 grid-rows-2">
            {covers.map((song) => (
              <img
                key={song._id || song.youtubeId || song.image}
                src={song.image}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ))}
          </div>
        ) : covers.length === 1 ? (
          <img src={covers[0].image} alt={playlist.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FiMusic className="h-16 w-16 text-spotify-green/70" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-80" />
        <button
          className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-spotify-green text-black opacity-0 shadow-xl transition-all group-hover:translate-y-0 group-hover:opacity-100"
          aria-label={`Open ${playlist.name}`}
        >
          <FiPlay className="ml-0.5 h-5 w-5" />
        </button>
      </div>
      <h3 className="truncate font-semibold">{playlist.name}</h3>
      <p className="mt-1 text-sm text-spotify-light">
        {songCount} {songCount === 1 ? "song" : "songs"}
      </p>
    </motion.div>
  );
};

export default PlaylistCard;
