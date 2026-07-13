import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlay, FiEdit2, FiTrash2, FiMusic, FiShare2 } from "react-icons/fi";
import { playlistService } from "../services/playlistService";
import { normalizeBackendTrack } from "../utils/normalize";
import { usePlayer } from "../hooks/usePlayer";
import { formatDuration } from "../utils/formatDuration";
import Modal from "../components/Modal";
import LoadingSpinner from "../components/LoadingSpinner";
import { PLACEHOLDER_IMAGE } from "../utils/constants";
import toast from "react-hot-toast";

const PlaylistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const { playQueue } = usePlayer();

  const loadPlaylist = async () => {
    try {
      const data = await playlistService.getById(id);
      setPlaylist(data);
      setNewName(data.name);
    } catch (err) {
      toast.error(err.message || "Failed to load playlist");
      navigate("/playlists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  const handleRename = async (e) => {
    e.preventDefault();
    try {
      const updated = await playlistService.update(id, { name: newName.trim() });
      setPlaylist(updated);
      setRenameOpen(false);
      toast.success("Playlist renamed");
    } catch (err) {
      toast.error(err.message || "Failed to rename");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this playlist?")) return;
    try {
      await playlistService.delete(id);
      toast.success("Playlist deleted");
      navigate("/playlists");
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      const updated = await playlistService.removeSong(id, songId);
      setPlaylist(updated);
      toast.success("Song removed");
    } catch (err) {
      toast.error(err.message || "Failed to remove song");
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/playlists/${id}`;
    if (navigator.share) {
      navigator.share({
        title: playlist.name,
        text: `Check out my playlist "${playlist.name}" on Music AI Streaming`,
        url: shareUrl
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard");
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!playlist) return null;

  const songs = (playlist.songs || []).map(normalizeBackendTrack);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
        <div className="w-48 h-48 rounded-lg bg-spotify-gray flex items-center justify-center shadow-2xl">
          {songs[0]?.image ? (
            <img src={songs[0].image} alt="" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <FiMusic className="w-20 h-20 text-spotify-light" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-spotify-light text-sm uppercase">Playlist</p>
          <h1 className="text-4xl font-extrabold">{playlist.name}</h1>
          <p className="text-spotify-light mt-2">{songs.length} songs</p>
          <div className="flex gap-3 mt-4">
            {songs.length > 0 && (
              <button onClick={() => playQueue(songs, 0)} className="btn-primary flex items-center gap-2">
                <FiPlay /> Play All
              </button>
            )}
            <button onClick={handleShare} className="btn-secondary flex items-center gap-2">
              <FiShare2 /> Share
            </button>
            <button onClick={() => setRenameOpen(true)} className="btn-secondary flex items-center gap-2">
              <FiEdit2 /> Rename
            </button>
            <button onClick={handleDelete} className="btn-secondary flex items-center gap-2 text-red-400 border-red-400/30">
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {songs.map((song, i) => (
          <div
            key={song._id || song.youtubeId}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 group cursor-pointer"
            onClick={() => playQueue(songs, i)}
          >
            <span className="text-spotify-light w-6 text-center text-sm">{i + 1}</span>
            <img
              src={song.image || PLACEHOLDER_IMAGE}
              alt=""
              className="w-10 h-10 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{song.title}</p>
              <p className="text-spotify-light text-sm truncate">{song.artist}</p>
            </div>
            <span className="text-spotify-light text-sm hidden sm:block">
              {formatDuration(song.durationMs)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveSong(song._id);
              }}
              className="p-2 text-spotify-light hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Remove song"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={renameOpen} onClose={() => setRenameOpen(false)} title="Rename Playlist">
        <form onSubmit={handleRename} className="space-y-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="input-field"
            required
          />
          <button type="submit" className="btn-primary w-full">Save</button>
        </form>
      </Modal>
    </motion.div>
  );
};

export default PlaylistDetails;
