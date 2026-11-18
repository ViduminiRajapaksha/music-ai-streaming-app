import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import { useMusic } from "../hooks/useMusic";
import FavoriteCard from "../components/FavoriteCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import PageHero from "../components/PageHero";

const Favorites = () => {
  const { favorites, favoritesLoading } = useMusic();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <PageHero
        eyebrow="Your library"
        title="Favorites"
        description="Your saved songs in one place, ready whenever you want to replay them."
        stat={`${favorites.length} ${favorites.length === 1 ? "song" : "songs"} saved`}
        icon={FiHeart}
      />

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
