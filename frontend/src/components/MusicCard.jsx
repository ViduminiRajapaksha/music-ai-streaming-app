import { useState } from "react";
import { motion } from "framer-motion";
import { FiPlay, FiHeart, FiPause, FiList, FiPlus } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { usePlayer } from "../hooks/usePlayer";
import { useMusic } from "../hooks/useMusic";
import { useAuthContext } from "../context/AuthContext";
import { playlistService } from "../services/playlistService";
import { formatDuration } from "../utils/formatDuration";
import { PLACEHOLDER_IMAGE } from "../utils/constants";
import toast from "react-hot-toast";

const MusicCard = ({ track, index = 0, showPlay = true, queue = [] }) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const { isFavorite, toggleFavorite } = useMusic();
  const { isAuthenticated } = useAuthContext();
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [adding, setAdding] = useState("");

  const trackId = track.youtubeId || track.id;
  const isCurrent = currentTrack?.youtubeId === trackId;
  const isFav = isFavorite(trackId);

  const getPlaylistPayload = () => {
    const isLocalSong = Boolean(track._id && track.audioURL);

    if (isLocalSong) {
      return { songId: track._id };
    }

    return {
      youtubeId: track.youtubeId || track.id,
      title: track.title || track.name,
      artist: track.artist || track.artists?.map((artist) => artist.name).join(", ") || "Unknown Artist",
      album: typeof track.album === "string" ? track.album : track.album?.name || "",
      image: track.image || track.album?.images?.[0]?.url || track.thumbnails?.high?.url || track.thumbnails?.default?.url || "",
      previewUrl: track.previewUrl || track.preview_url || track.audioURL || "",
      durationMs: track.durationMs || track.duration_ms || 0
    };
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queue.length ? queue : [track]);
    }
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(track);
  };

  const loadPlaylists = async () => {
    setPlaylistLoading(true);
    try {
      setPlaylists(await playlistService.getAll());
    } catch (err) {
      toast.error(err.message || "Failed to load playlists");
    } finally {
      setPlaylistLoading(false);
    }
  };

  const handlePlaylistToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please login to use playlists");
      return;
    }

    const nextOpen = !playlistOpen;
    setPlaylistOpen(nextOpen);
    if (nextOpen && playlists.length === 0) {
      await loadPlaylists();
    }
  };

  const addToPlaylist = async (playlistId) => {
    setAdding(playlistId);
    try {
      await playlistService.addSong(playlistId, getPlaylistPayload());
      toast.success("Added to playlist");
      setPlaylistOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to add to playlist");
    } finally {
      setAdding("");
    }
  };

  const createPlaylistAndAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const name = newPlaylistName.trim();
    if (!name) return;

    setAdding("new");
    try {
      const playlist = await playlistService.create({ name });
      await playlistService.addSong(playlist._id, getPlaylistPayload());
      setPlaylists((prev) => [playlist, ...prev]);
      setNewPlaylistName("");
      setPlaylistOpen(false);
      toast.success(`Added to ${playlist.name}`);
    } catch (err) {
      toast.error(err.message || "Failed to create playlist");
    } finally {
      setAdding("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-gray-100 dark:bg-spotify-dark/50 p-4 rounded-xl card-hover cursor-pointer"
      onClick={handlePlay}
    >
      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-lg">
        <img
          src={track.image || PLACEHOLDER_IMAGE}
          alt={track.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {showPlay && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.1 }}
            className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full
                       flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100
                       transition-opacity duration-200"
            onClick={handlePlay}
            aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
          >
            {isCurrent && isPlaying ? (
              <FiPause className="w-5 h-5 text-black" />
            ) : (
              <FiPlay className="w-5 h-5 text-black ml-0.5" />
            )}
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 1.3 }}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/50 opacity-0
                     group-hover:opacity-100 transition-opacity"
          onClick={handleFavorite}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          {isFav ? (
            <FaHeart className="w-4 h-4 text-spotify-green" />
          ) : (
            <FiHeart className="w-4 h-4 text-white" />
          )}
        </motion.button>
        <motion.button
          whileTap={{ scale: 1.2 }}
          className="absolute top-2 left-2 p-2 rounded-full bg-black/50 opacity-0
                     group-hover:opacity-100 transition-opacity"
          onClick={handlePlaylistToggle}
          aria-label="Add to playlist"
          title="Add to playlist"
        >
          <FiList className="w-4 h-4 text-white" />
        </motion.button>
      </div>
      {playlistOpen && (
        <div
          className="absolute left-3 right-3 top-14 z-30 rounded-lg border border-white/10 bg-spotify-dark p-3 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-2 text-xs font-semibold text-spotify-light">Add to playlist</p>
          <div className="max-h-36 space-y-1 overflow-y-auto pr-1">
            {playlistLoading ? (
              <p className="text-xs text-spotify-light">Loading...</p>
            ) : playlists.length ? (
              playlists.map((playlist) => (
                <button
                  key={playlist._id}
                  type="button"
                  disabled={Boolean(adding)}
                  onClick={() => addToPlaylist(playlist._id)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="truncate">{playlist.name}</span>
                  {adding === playlist._id && <span className="text-xs text-spotify-light">Adding...</span>}
                </button>
              ))
            ) : (
              <p className="text-xs text-spotify-light">No playlists yet.</p>
            )}
          </div>
          <form onSubmit={createPlaylistAndAdd} className="mt-3 flex gap-2">
            <input
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs outline-none focus:border-spotify-green"
              placeholder="New playlist"
            />
            <button
              type="submit"
              disabled={!newPlaylistName.trim() || Boolean(adding)}
              className="rounded-md bg-spotify-green px-2 text-black disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Create playlist and add song"
              title="Create playlist and add song"
            >
              <FiPlus className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
      <h3 className="font-semibold truncate text-sm">{track.title}</h3>
      <p className="text-gray-500 dark:text-spotify-light text-xs truncate mt-1">{track.artist}</p>
      {track.durationMs > 0 && (
        <p className="text-gray-400 dark:text-spotify-light text-xs mt-1">{formatDuration(track.durationMs)}</p>
      )}
    </motion.div>
  );
};

export default MusicCard;
