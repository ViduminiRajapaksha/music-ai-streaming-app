import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiFileText } from "react-icons/fi";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setData(await adminService.getReports());
      } catch (err) {
        toast.error(err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner text="Loading reports..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3"><FiFileText className="text-spotify-green" /> Reports</h1>
        <p className="text-spotify-light mt-1">Revenue, subscriptions, downloads, and listening activity reports.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-spotify-dark/50 rounded-xl p-5">
          <p className="text-sm text-spotify-light">Premium Users</p>
          <p className="text-3xl font-bold mt-2">{data?.revenue?.premiumUsers || 0}</p>
        </div>
        <div className="bg-spotify-dark/50 rounded-xl p-5">
          <p className="text-sm text-spotify-light">MRR</p>
          <p className="text-3xl font-bold mt-2">${data?.revenue?.monthlyRecurringRevenue || 0}</p>
        </div>
        <div className="bg-spotify-dark/50 rounded-xl p-5">
          <p className="text-sm text-spotify-light">Annual Run Rate</p>
          <p className="text-3xl font-bold mt-2">${data?.revenue?.annualRunRate || 0}</p>
        </div>
      </div>

      <section className="bg-spotify-dark/50 rounded-xl p-5 overflow-x-auto">
        <h2 className="font-bold mb-4">Recent Downloads</h2>
        <table className="w-full text-sm">
          <thead className="text-spotify-light text-left">
            <tr><th className="py-2">User</th><th>Song</th><th>Downloaded</th></tr>
          </thead>
          <tbody>
            {(data?.downloads || []).map((item) => (
              <tr key={item._id} className="border-t border-white/5">
                <td className="py-2">{item.user?.username || "Unknown"}</td>
                <td>{item.song?.title || "Deleted song"}</td>
                <td>{new Date(item.downloadedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-spotify-dark/50 rounded-xl p-5 overflow-x-auto">
        <h2 className="font-bold mb-4">Listening Activity</h2>
        <table className="w-full text-sm">
          <thead className="text-spotify-light text-left">
            <tr><th className="py-2">Song</th><th>Artist</th><th>Played At</th></tr>
          </thead>
          <tbody>
            {(data?.listening || []).map((item) => (
              <tr key={item._id} className="border-t border-white/5">
                <td className="py-2">{item.title}</td>
                <td>{item.artist}</td>
                <td>{new Date(item.playedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </motion.div>
  );
};

export default AdminReports;
