import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiDownload, FiHeart, FiList, FiPlay, FiShare2, FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { musicService } from "../services/musicService";
import { libraryService } from "../services/libraryService";
import { playlistService } from "../services/playlistService";
import { normalizeYouTubeTrack } from "../utils/normalize";
import { trackToPlaylistPayload } from "../utils/normalize";
import { usePlayer } from "../hooks/usePlayer";
import { useMusic } from "../hooks/useMusic";
import { formatDuration } from "../utils/formatDuration";
import { API_ORIGIN, PLACEHOLDER_IMAGE } from "../utils/constants";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import toast from "react-hot-toast";

const SongDetails = () => {
  const { id } = useParams();
  const [track, setTrack] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { playTrack, saveOfflineTrack } = usePlayer();
  const { isFavorite, toggleFavorite } = useMusic();

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const data = await musicService.getTrack(id);
        setTrack(normalizeYouTubeTrack(data));
      } catch (err) {
        toast.error(err.message || "Failed to load track");
      } finally {
        setLoading(false);
      }
    };
    fetchTrack();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!track) return <p className="text-center text-spotify-light">Track not found</p>;

  const isFav = isFavorite(track.id);
  const isLocalSong = Boolean(track._id && track.audioURL);

  const handlePlay = async () => {
    playTrack(track, [track]);
    if (isLocalSong) {
      try {
        await libraryService.recordSongPlay(track._id);
      } catch {
        // Play count sync should not block listening.
      }
    }
  };

  const handleLike = async () => {
    if (!isLocalSong) return toggleFavorite(track);
    try {
      const data = await libraryService.likeSong(track._id);
      setTrack((prev) => ({ ...prev, likes: data.likes, dislikes: data.dislikes }));
      toast.success("Like updated");
    } catch (err) {
      toast.error(err.message || "Failed to update like");
    }
  };

  const handleDislike = async () => {
    if (!isLocalSong) return;
    try {
      const data = await libraryService.dislikeSong(track._id);
      setTrack((prev) => ({ ...prev, likes: data.likes, dislikes: data.dislikes }));
      toast.success("Dislike updated");
    } catch (err) {
      toast.error(err.message || "Failed to update dislike");
    }
  };

  const handleDownload = async () => {
    if (!isLocalSong) return;
    try {
      const downloadUrl = await libraryService.downloadSong(track._id);
      const resolvedUrl = /^https?:\/\//i.test(downloadUrl)
        ? downloadUrl
        : `${API_ORIGIN}${downloadUrl}`;
      saveOfflineTrack(track);
      window.open(resolvedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err.message || "Download failed");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Song link copied");
    } catch {
      toast.error("Could not copy share link");
    }
  };

  const openPlaylistModal = async () => {
    try {
      setPlaylists(await playlistService.getAll());
      setPlaylistOpen(true);
    } catch (err) {
      toast.error(err.message || "Failed to load playlists");
    }
  };

  const addToPlaylist = async (playlistId) => {
    try {
      const payload = isLocalSong ? { songId: track._id } : trackToPlaylistPayload(track);
      await playlistService.addSong(playlistId, payload);
      setPlaylistOpen(false);
      toast.success("Added to playlist");
    } catch (err) {
      toast.error(err.message || "Failed to add to playlist");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <img
          src={track.image || PLACEHOLDER_IMAGE}
          alt={track.title}
          className="w-64 h-64 rounded-xl shadow-2xl object-cover mx-auto md:mx-0"
        />
        <div className="flex-1 text-center md:text-left">
          <p className="text-spotify-light text-sm uppercase tracking-wider mb-2">Song</p>
          <h1 className="text-4xl font-extrabold mb-2">{track.title}</h1>
          <p className="text-xl text-spotify-light mb-4">{track.artist}</p>
          {track.album && (
            <p className="text-spotify-light mb-4">Album: {track.album}</p>
          )}
          <p className="text-spotify-light mb-6">{formatDuration(track.durationMs)}</p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePlay}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlay /> Play Preview
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleFavorite(track)}
              className="btn-secondary flex items-center gap-2"
            >
              {isFav ? <FaHeart className="text-spotify-green" /> : <FiHeart />}
              {isFav ? "Favorited" : "Favorite"}
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleLike} className="btn-secondary flex items-center gap-2">
              <FiThumbsUp /> {track.likes || 0}
            </motion.button>
            {isLocalSong && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleDislike} className="btn-secondary flex items-center gap-2">
                <FiThumbsDown /> {track.dislikes || 0}
              </motion.button>
            )}
            <motion.button whileTap={{ scale: 0.95 }} onClick={openPlaylistModal} className="btn-secondary flex items-center gap-2">
              <FiList /> Playlist
            </motion.button>
            {isLocalSong && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleDownload} className="btn-secondary flex items-center gap-2">
                <FiDownload /> Download
              </motion.button>
            )}
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleShare} className="btn-secondary flex items-center gap-2">
              <FiShare2 /> Share
            </motion.button>
          </div>
        </div>
      </div>

      {track.lyrics && (
        <section className="mt-10">
          <h2 className="section-title">Lyrics</h2>
          <pre className="whitespace-pre-wrap rounded-xl bg-spotify-dark/50 p-5 text-spotify-light font-sans">
            {track.lyrics}
          </pre>
        </section>
      )}

      <Modal isOpen={playlistOpen} onClose={() => setPlaylistOpen(false)} title="Add to Playlist">
        <div className="space-y-2">
          {playlists.length ? playlists.map((playlist) => (
            <button
              key={playlist._id}
              onClick={() => addToPlaylist(playlist._id)}
              className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <p className="font-medium">{playlist.name}</p>
              <p className="text-sm text-spotify-light">{playlist.songs?.length || 0} songs</p>
            </button>
          )) : <p className="text-spotify-light">Create a playlist first.</p>}
        </div>
      </Modal>
    </motion.div>
  );
};

export default SongDetails;
