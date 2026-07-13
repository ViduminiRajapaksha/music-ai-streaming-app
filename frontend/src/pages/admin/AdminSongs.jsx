import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiMusic, FiTrash2 } from "react-icons/fi";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";
import { GENRES } from "../../utils/constants";
import toast from "react-hot-toast";

const AdminSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSongs(status ? { status } : {});
      setSongs(data.songs || []);
    } catch (err) {
      toast.error(err.message || "Failed to load songs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const updateSong = async (id, changes) => {
    try {
      const song = await adminService.updateSong(id, changes);
      setSongs((prev) => prev.map((item) => item._id === id ? song : item));
      toast.success("Song updated");
    } catch (err) {
      toast.error(err.message || "Failed to update song");
    }
  };

  const deleteSong = async (id) => {
    if (!confirm("Delete this song?")) return;
    try {
      await adminService.deleteSong(id);
      setSongs((prev) => prev.filter((item) => item._id !== id));
      toast.success("Song deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete song");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><FiMusic className="text-spotify-green" /> Songs</h1>
          <p className="text-spotify-light mt-1">Approve, edit, feature, premium-lock, or delete songs.</p>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field md:w-56">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-spotify-dark/50 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-spotify-light">
              <tr><th className="p-3">Song</th><th>Genre</th><th>Status</th><th>Premium</th><th>Featured</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr key={song._id} className="border-t border-white/5">
                  <td className="p-3">
                    <input value={song.title} onChange={(e) => updateSong(song._id, { title: e.target.value })} className="bg-transparent border border-white/10 rounded px-2 py-1 w-full" />
                    <p className="text-xs text-spotify-light mt-1">{song.artist} · {song.plays} plays</p>
                  </td>
                  <td>
                    <select value={song.genre} onChange={(e) => updateSong(song._id, { genre: e.target.value })} className="bg-transparent border border-white/10 rounded px-2 py-1">
                      {GENRES.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={song.status || "approved"} onChange={(e) => updateSong(song._id, { status: e.target.value })} className="bg-transparent border border-white/10 rounded px-2 py-1">
                      <option value="pending">pending</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </td>
                  <td><input type="checkbox" checked={song.isPremium} onChange={(e) => updateSong(song._id, { isPremium: e.target.checked })} /></td>
                  <td><input type="checkbox" checked={song.isFeatured} onChange={(e) => updateSong(song._id, { isFeatured: e.target.checked })} /></td>
                  <td>
                    <button onClick={() => deleteSong(song._id)} className="p-2 text-spotify-light hover:text-red-400" aria-label="Delete song"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default AdminSongs;
