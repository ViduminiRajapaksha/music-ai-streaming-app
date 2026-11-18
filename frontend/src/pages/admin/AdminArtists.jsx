import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiTrash2, FiUserX, FiUsers } from "react-icons/fi";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";
import PageHero from "../../components/PageHero";
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
      <PageHero
        eyebrow="Admin Library"
        title="Artists"
        description="Approve, suspend, or delete artist accounts."
        stat={`${artists.length} artists shown`}
        icon={FiUsers}
      />

      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-3">
          {artists.map((artist) => (
            <div key={artist._id} className="flex flex-col gap-3 rounded-lg bg-white/[0.06] p-4 ring-1 ring-white/10 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{artist.username}</p>
                <p className="text-sm text-spotify-light">{artist.email}</p>
                <p className="text-xs text-spotify-light mt-1">{artist.songs} songs - {artist.plays} plays - {artist.artistStatus}</p>
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
