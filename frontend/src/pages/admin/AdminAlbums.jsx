import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiDisc, FiTrash2 } from "react-icons/fi";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";
import { GENRES } from "../../utils/constants";
import toast from "react-hot-toast";

const AdminAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAlbums(status ? { status } : {});
      setAlbums(data.albums || []);
    } catch (err) {
      toast.error(err.message || "Failed to load albums");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const updateAlbum = async (id, changes) => {
    try {
      const album = await adminService.updateAlbum(id, changes);
      setAlbums((prev) => prev.map((item) => item._id === id ? album : item));
      toast.success("Album updated");
    } catch (err) {
      toast.error(err.message || "Failed to update album");
    }
  };

  const deleteAlbum = async (id) => {
    if (!confirm("Delete this album?")) return;
    try {
      await adminService.deleteAlbum(id);
      setAlbums((prev) => prev.filter((item) => item._id !== id));
      toast.success("Album deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete album");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><FiDisc className="text-spotify-green" /> Albums</h1>
          <p className="text-spotify-light mt-1">Manage album metadata, approval, and featured placement.</p>
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
              <tr><th className="p-3">Album</th><th>Genre</th><th>Status</th><th>Featured</th><th>Songs</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {albums.map((album) => (
                <tr key={album._id} className="border-t border-white/5">
                  <td className="p-3">
                    <input value={album.title} onChange={(e) => updateAlbum(album._id, { title: e.target.value })} className="bg-transparent border border-white/10 rounded px-2 py-1 w-full" />
                    <p className="text-xs text-spotify-light mt-1">{album.artist} · {album.views} views</p>
                  </td>
                  <td>
                    <select value={album.genre || ""} onChange={(e) => updateAlbum(album._id, { genre: e.target.value })} className="bg-transparent border border-white/10 rounded px-2 py-1">
                      <option value="">None</option>
                      {GENRES.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={album.status || "approved"} onChange={(e) => updateAlbum(album._id, { status: e.target.value })} className="bg-transparent border border-white/10 rounded px-2 py-1">
                      <option value="pending">pending</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </td>
                  <td><input type="checkbox" checked={album.isFeatured} onChange={(e) => updateAlbum(album._id, { isFeatured: e.target.checked })} /></td>
                  <td>{album.songs?.length || 0}</td>
                  <td>
                    <button onClick={() => deleteAlbum(album._id)} className="p-2 text-spotify-light hover:text-red-400" aria-label="Delete album"><FiTrash2 /></button>
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

export default AdminAlbums;
