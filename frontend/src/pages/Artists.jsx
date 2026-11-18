import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiUsers } from "react-icons/fi";
import { libraryService } from "../services/libraryService";
import ArtistCard from "../components/ArtistCard";
import EmptyState from "../components/EmptyState";
import PageHero from "../components/PageHero";
import { SkeletonGrid } from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const Artists = () => {
  const [artists, setArtists] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setArtists(await libraryService.getArtists());
      } catch (err) {
        toast.error(err.message || "Failed to load artists");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return artists;
    return artists.filter((artist) => artist.name.toLowerCase().includes(q));
  }, [artists, query]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHero
        eyebrow="Discover"
        title="Artists"
        description="Discover creators publishing songs, albums, and podcasts."
        stat={`${filtered.length} ${filtered.length === 1 ? "artist" : "artists"}`}
        icon={FiUsers}
        action={
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter artists"
          className="input-field md:w-72"
        />
        }
      />

      {loading ? (
        <SkeletonGrid count={8} />
      ) : filtered.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((artist, i) => <ArtistCard key={artist.id || artist.name} artist={artist} index={i} />)}
        </div>
      ) : (
        <EmptyState icon={FiUsers} title="No artists found" description="Artist profiles are created from uploaded library content." />
      )}
    </motion.div>
  );
};

export default Artists;
