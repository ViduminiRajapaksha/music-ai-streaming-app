import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiDisc, FiMusic, FiRadio, FiUsers } from "react-icons/fi";
import { libraryService } from "../services/libraryService";
import { normalizeLibraryAlbum, normalizeLibraryPodcast, normalizeLibrarySong } from "../utils/normalize";
import AlbumCard from "../components/AlbumCard";
import ArtistCard from "../components/ArtistCard";
import EmptyState from "../components/EmptyState";
import LoadingSpinner, { SkeletonGrid } from "../components/LoadingSpinner";
import MusicCard from "../components/MusicCard";
import toast from "react-hot-toast";

const Library = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setData(await libraryService.getLibrary());
      } catch (err) {
        toast.error(err.message || "Failed to load library");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const songs = (data?.songs || []).map(normalizeLibrarySong).filter(Boolean);
  const albums = (data?.albums || []).map(normalizeLibraryAlbum).filter(Boolean);
  const podcasts = (data?.podcasts || []).map(normalizeLibraryPodcast).filter(Boolean);
  const artists = data?.artists || [];

  if (loading) return <SkeletonGrid count={8} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Library</h1>
        <p className="text-spotify-light mt-1">Songs, albums, podcasts, artists, and playlists in one place.</p>
      </div>

      {songs.length === 0 && albums.length === 0 && podcasts.length === 0 ? (
        <EmptyState icon={FiMusic} title="No library uploads yet" description="Artist uploads will appear here." />
      ) : (
        <>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Latest Songs</h2>
              <Link to="/search" className="text-sm text-spotify-green">Search all</Link>
            </div>
            {songs.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {songs.map((song, i) => <MusicCard key={song.id} track={song} index={i} queue={songs} />)}
              </div>
            ) : <LoadingSpinner text="Waiting for songs..." />}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Albums</h2>
              <Link to="/albums" className="text-sm text-spotify-green">View all</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {albums.map((album, i) => <AlbumCard key={album.id} album={album} index={i} />)}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Artists</h2>
              <Link to="/artists" className="text-sm text-spotify-green">View all</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {artists.map((artist, i) => <ArtistCard key={artist.id || artist.name} artist={artist} index={i} />)}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <FiRadio className="text-spotify-green" />
              <h2 className="section-title mb-0">Podcasts</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {podcasts.map((podcast, i) => <MusicCard key={podcast.id} track={podcast} index={i} queue={podcasts} />)}
            </div>
          </section>
        </>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/albums" className="btn-secondary flex items-center justify-center gap-2"><FiDisc /> Albums</Link>
        <Link to="/artists" className="btn-secondary flex items-center justify-center gap-2"><FiUsers /> Artists</Link>
        <Link to="/genres" className="btn-secondary flex items-center justify-center gap-2"><FiMusic /> Genres</Link>
      </div>
    </motion.div>
  );
};

export default Library;
