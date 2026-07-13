import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiTrash2, FiUserX, FiUsers } from "react-icons/fi";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

const AdminArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setArtists(await adminService.getArtists());
    } catch (err) {
      toast.error(err.message || "Failed to load artists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const applyAction = async (action, id) => {
    try {
      if (action === "approve") await adminService.approveArtist(id);
      if (action === "suspend") await adminService.suspendArtist(id, "Suspended by admin");
      if (action === "delete") {
        if (!confirm("Delete this artist and uploaded catalog?")) return;
        await adminService.deleteArtist(id);
      }
      await load();
      toast.success("Artist updated");
    } catch (err) {
      toast.error(err.message || "Artist action failed");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3"><FiUsers className="text-spotify-green" /> Artists</h1>
        <p className="text-spotify-light mt-1">Approve, suspend, or delete artist accounts.</p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-3">
          {artists.map((artist) => (
            <div key={artist._id} className="bg-spotify-dark/50 rounded-xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{artist.username}</p>
                <p className="text-sm text-spotify-light">{artist.email}</p>
                <p className="text-xs text-spotify-light mt-1">{artist.songs} songs · {artist.plays} plays · {artist.artistStatus}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => applyAction("approve", artist._id)} className="btn-secondary flex items-center gap-2"><FiCheck /> Approve</button>
                <button onClick={() => applyAction("suspend", artist._id)} className="btn-secondary flex items-center gap-2"><FiUserX /> Suspend</button>
                <button onClick={() => applyAction("delete", artist._id)} className="btn-secondary flex items-center gap-2 text-red-400"><FiTrash2 /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AdminArtists;
