import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiTrendingUp } from "react-icons/fi";
import { libraryService } from "../services/libraryService";
import { normalizeLibraryAlbum, normalizeLibraryPodcast, normalizeLibrarySong } from "../utils/normalize";
import AlbumCard from "../components/AlbumCard";
import EmptyState from "../components/EmptyState";
import LoadingSpinner, { SkeletonGrid } from "../components/LoadingSpinner";
import MusicCard from "../components/MusicCard";
import toast from "react-hot-toast";

const Trending = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setData(await libraryService.getTrending(20));
      } catch (err) {
        toast.error(err.message || "Failed to load trending music");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const songs = (data?.songs || []).map(normalizeLibrarySong).filter(Boolean);
  const albums = (data?.albums || []).map(normalizeLibraryAlbum).filter(Boolean);
  const podcasts = (data?.podcasts || []).map(normalizeLibraryPodcast).filter(Boolean);

  if (loading) return <SkeletonGrid count={8} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Trending</h1>
        <p className="text-spotify-light mt-1">Most-played songs, albums, and podcasts from the local library.</p>
      </div>

      {songs.length === 0 && albums.length === 0 && podcasts.length === 0 ? (
        <EmptyState icon={FiTrendingUp} title="Nothing is trending yet" description="Plays and likes will build this chart." />
      ) : (
        <>
          <section>
            <h2 className="section-title">Trending Songs</h2>
            {songs.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {songs.map((song, i) => <MusicCard key={song.id} track={song} index={i} queue={songs} />)}
              </div>
            ) : <LoadingSpinner text="No song trends yet" />}
          </section>

          <section>
            <h2 className="section-title">Trending Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {albums.map((album, i) => <AlbumCard key={album.id} album={album} index={i} />)}
            </div>
          </section>

          <section>
            <h2 className="section-title">Trending Podcasts</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {podcasts.map((podcast, i) => <MusicCard key={podcast.id} track={podcast} index={i} queue={podcasts} />)}
            </div>
          </section>
        </>
      )}
    </motion.div>
  );
};

export default Trending;
