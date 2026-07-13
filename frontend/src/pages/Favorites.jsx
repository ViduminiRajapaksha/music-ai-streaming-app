import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import { useMusic } from "../hooks/useMusic";
import FavoriteCard from "../components/FavoriteCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

const Favorites = () => {
  const { favorites, favoritesLoading } = useMusic();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold mb-2">Your Favorites</h1>
      <p className="text-spotify-light mb-8">
        {favorites.length} {favorites.length === 1 ? "song" : "songs"} saved
      </p>

      {favoritesLoading ? (
        <LoadingSpinner text="Loading favorites..." />
      ) : favorites.length > 0 ? (
        <div className="glass rounded-xl divide-y divide-white/5">
          {favorites.map((fav, i) => (
            <FavoriteCard key={fav._id || fav.spotifyId} favorite={fav} index={i} queue={favorites} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FiHeart}
          title="No favorites yet"
          description="Tap the heart icon on any song to save it here."
        />
      )}
    </motion.div>
  );
};

export default Favorites;
