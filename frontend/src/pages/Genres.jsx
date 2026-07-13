import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiGrid } from "react-icons/fi";
import { libraryService } from "../services/libraryService";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const genreColors = [
  "from-emerald-500 to-cyan-600",
  "from-rose-500 to-orange-500",
  "from-indigo-500 to-sky-500",
  "from-amber-500 to-lime-500",
  "from-fuchsia-500 to-pink-600",
  "from-teal-500 to-blue-600"
];

const Genres = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setGenres(await libraryService.getGenres());
      } catch (err) {
        toast.error(err.message || "Failed to load genres");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner text="Loading genres..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Genres</h1>
        <p className="text-spotify-light mt-1">Explore Pop, Rock, Jazz, Classical, Hip-Hop, EDM, Sinhala, Tamil, English, and Instrumental music.</p>
      </div>

      {genres.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {genres.map((genre, index) => (
            <Link
              key={genre.name}
              to={`/search?genre=${encodeURIComponent(genre.name)}`}
              className={`min-h-36 rounded-xl p-5 bg-gradient-to-br ${genreColors[index % genreColors.length]} card-hover overflow-hidden relative`}
            >
              <div className="relative z-10">
                <p className="text-2xl font-extrabold text-white">{genre.name}</p>
                <p className="text-white/80 mt-2">{genre.songs} songs</p>
                <p className="text-white/70 text-sm">{genre.plays} plays</p>
              </div>
              <FiGrid className="absolute -right-3 -bottom-3 w-24 h-24 text-white/20" />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={FiGrid} title="No genres yet" description="Uploaded songs will populate genre counts." />
      )}
    </motion.div>
  );
};

export default Genres;
