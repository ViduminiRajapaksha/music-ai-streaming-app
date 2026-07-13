import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PLACEHOLDER_IMAGE } from "../utils/constants";

const ArtistCard = ({ artist, index = 0 }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group text-center cursor-pointer card-hover p-4 rounded-xl"
      onClick={() => navigate(`/artist/${artist.id}`)}
    >
      <div className="aspect-square mb-4 rounded-full overflow-hidden shadow-lg mx-auto max-w-[180px]">
        <img
          src={artist.images?.[0]?.url || artist.image || PLACEHOLDER_IMAGE}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <h3 className="font-semibold truncate">{artist.name}</h3>
      <p className="text-spotify-light text-sm mt-1">Artist</p>
    </motion.div>
  );
};

export default ArtistCard;
