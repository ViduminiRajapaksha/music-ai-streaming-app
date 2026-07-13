import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlay } from "react-icons/fi";
import { musicService } from "../services/musicService";
import { normalizeLibraryAlbum, normalizeLibrarySong, normalizeYouTubeTrack } from "../utils/normalize";
import { formatDuration } from "../utils/formatDuration";
import { usePlayer } from "../hooks/usePlayer";
import LoadingSpinner from "../components/LoadingSpinner";
import { PLACEHOLDER_IMAGE } from "../utils/constants";
import toast from "react-hot-toast";

const AlbumDetails = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const { playQueue } = usePlayer();

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const data = await musicService.getAlbum(id);
        setAlbum(data);
      } catch (err) {
        toast.error(err.message || "Failed to load album");
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!album) return <p className="text-center text-spotify-light">Album not found</p>;

  const isLocalAlbum = Boolean(album._id || album.songs);
  const normalizedAlbum = isLocalAlbum ? normalizeLibraryAlbum(album) : album;
  const tracks = isLocalAlbum
    ? (album.songs || []).map(normalizeLibrarySong).filter(Boolean)
    : (album.tracks?.items || []).map(normalizeYouTubeTrack).filter(Boolean);
  const artistName = album.artists?.map((a) => a.name).join(", ") || "";
  const displayArtist = normalizedAlbum.artist || artistName;
  const releaseDate = album.release_date || normalizedAlbum.releaseDate?.slice?.(0, 10) || "";
  const totalTracks = album.total_tracks || normalizedAlbum.totalTracks || tracks.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 items-end">
        <img
          src={album.images?.[0]?.url || normalizedAlbum.image || PLACEHOLDER_IMAGE}
          alt={normalizedAlbum.name}
          className="w-56 h-56 rounded-lg shadow-2xl object-cover"
        />
        <div>
          <p className="text-spotify-light text-sm uppercase">Album</p>
          <h1 className="text-4xl font-extrabold">{normalizedAlbum.name}</h1>
          <p className="text-spotify-light mt-2">
            {[displayArtist, releaseDate, `${totalTracks} tracks`].filter(Boolean).join(" - ")}
          </p>
          {normalizedAlbum.description && (
            <p className="text-spotify-light mt-3 max-w-2xl">{normalizedAlbum.description}</p>
          )}
          {tracks.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => playQueue(tracks, 0)}
              className="btn-primary flex items-center gap-2 mt-4"
            >
              <FiPlay /> Play Album
            </motion.button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        {tracks.map((track, i) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 group cursor-pointer"
            onClick={() => playQueue(tracks, i)}
          >
            <span className="text-spotify-light w-6 text-center text-sm">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{track.title}</p>
              <p className="text-spotify-light text-sm truncate">{track.artist}</p>
            </div>
            <span className="text-spotify-light text-sm">
              {formatDuration(track.durationMs)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AlbumDetails;
