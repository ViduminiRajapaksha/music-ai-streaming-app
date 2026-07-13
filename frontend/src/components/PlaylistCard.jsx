import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMusic } from "react-icons/fi";

const PlaylistCard = ({ playlist, index = 0 }) => {
  const navigate = useNavigate();
  const songCount = playlist.songs?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group cursor-pointer card-hover p-4 rounded-xl bg-spotify-dark/50"
      onClick={() => navigate(`/playlists/${playlist._id}`)}
    >
      <div className="aspect-square mb-4 rounded-lg overflow-hidden shadow-lg bg-spotify-gray flex items-center justify-center">
        {playlist.songs?.[0]?.image ? (
          <img
            src={playlist.songs[0].image}
            alt={playlist.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <FiMusic className="w-16 h-16 text-spotify-light" />
        )}
      </div>
      <h3 className="font-semibold truncate">{playlist.name}</h3>
      <p className="text-spotify-light text-sm mt-1">
        {songCount} {songCount === 1 ? "song" : "songs"}
      </p>
    </motion.div>
  );
};

export default PlaylistCard;
