import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiMusic } from "react-icons/fi";
import { playlistService } from "../services/playlistService";
import PlaylistCard from "../components/PlaylistCard";
import Modal from "../components/Modal";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import toast from "react-hot-toast";

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const loadPlaylists = async () => {
    try {
      const data = await playlistService.getAll();
      setPlaylists(data);
    } catch (err) {
      toast.error(err.message || "Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const playlist = await playlistService.create({ name: newName.trim() });
      setPlaylists((prev) => [playlist, ...prev]);
      setNewName("");
      setModalOpen(false);
      toast.success("Playlist created!");
    } catch (err) {
      toast.error(err.message || "Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Playlists</h1>
          <p className="text-spotify-light mt-1">{playlists.length} playlists</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> Create Playlist
        </motion.button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading playlists..." />
      ) : playlists.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {playlists.map((playlist, i) => (
            <PlaylistCard key={playlist._id} playlist={playlist} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FiMusic}
          title="No playlists yet"
          description="Create your first playlist to organize your music."
          action={
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              Create Playlist
            </button>
          }
        />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Playlist">
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Playlist name"
            className="input-field"
            autoFocus
            required
          />
          <button type="submit" disabled={creating} className="btn-primary w-full">
            {creating ? "Creating..." : "Create"}
          </button>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Playlists;
