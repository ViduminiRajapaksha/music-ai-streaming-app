import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PLACEHOLDER_IMAGE } from "../utils/constants";

const AlbumCard = ({ album, index = 0 }) => {
  const navigate = useNavigate();
  const artistName = album.artists?.map((a) => a.name).join(", ") || album.artist || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group cursor-pointer card-hover p-4 rounded-xl bg-spotify-dark/50"
      onClick={() => navigate(`/album/${album.id}`)}
    >
      <div className="aspect-square mb-4 rounded-lg overflow-hidden shadow-lg">
        <img
          src={album.images?.[0]?.url || album.image || PLACEHOLDER_IMAGE}
          alt={album.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <h3 className="font-semibold truncate text-sm">{album.name}</h3>
      <p className="text-spotify-light text-xs truncate mt-1">{artistName}</p>
    </motion.div>
  );
};

export default AlbumCard;
