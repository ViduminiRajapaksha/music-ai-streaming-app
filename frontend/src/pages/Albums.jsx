import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiDisc } from "react-icons/fi";
import { libraryService } from "../services/libraryService";
import { normalizeLibraryAlbum } from "../utils/normalize";
import AlbumCard from "../components/AlbumCard";
import EmptyState from "../components/EmptyState";
import { SkeletonGrid } from "../components/LoadingSpinner";
import { GENRES } from "../utils/constants";
import toast from "react-hot-toast";

const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await libraryService.getAlbums(genre ? { genre } : {});
        setAlbums((data.albums || []).map(normalizeLibraryAlbum).filter(Boolean));
      } catch (err) {
        toast.error(err.message || "Failed to load albums");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [genre]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Albums</h1>
          <p className="text-spotify-light mt-1">Browse artist albums by release and genre.</p>
        </div>
        <select value={genre} onChange={(e) => setGenre(e.target.value)} className="input-field md:w-56">
          <option value="">All genres</option>
          {GENRES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      {loading ? (
        <SkeletonGrid count={8} />
      ) : albums.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {albums.map((album, i) => <AlbumCard key={album.id} album={album} index={i} />)}
        </div>
      ) : (
        <EmptyState icon={FiDisc} title="No albums found" description="Albums uploaded by artists will appear here." />
      )}
    </motion.div>
  );
};

export default Albums;
