import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiActivity, FiBarChart2, FiDisc, FiDollarSign, FiDownload, FiMusic, FiUsers } from "react-icons/fi";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

const Stat = ({ label, value, icon: Icon }) => (
  <div className="bg-spotify-dark/50 rounded-xl p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm text-spotify-light">{label}</p>
      <Icon className="text-spotify-green" />
    </div>
    <p className="text-3xl font-extrabold mt-3">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setData(await adminService.getDashboard());
      } catch (err) {
        toast.error(err.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner text="Loading admin dashboard..." />;

  const stats = data?.stats || {};
  const revenue = stats.revenue || {};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-spotify-light mt-1">Control users, artists, music, subscriptions, and analytics.</p>
        </div>
        <Link to="/admin/reports" className="btn-primary">Open Reports</Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Users" value={stats.users || 0} icon={FiUsers} />
        <Stat label="Active Users" value={stats.activeUsers || 0} icon={FiActivity} />
        <Stat label="Songs" value={stats.songs || 0} icon={FiMusic} />
        <Stat label="Albums" value={stats.albums || 0} icon={FiDisc} />
        <Stat label="Artists" value={stats.artists || 0} icon={FiUsers} />
        <Stat label="Downloads" value={stats.downloads || 0} icon={FiDownload} />
        <Stat label="AI Usage" value={stats.aiUsage || 0} icon={FiBarChart2} />
        <Stat label="Monthly Revenue" value={`$${revenue.monthlyRecurringRevenue || 0}`} icon={FiDollarSign} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="bg-spotify-dark/50 rounded-xl p-5">
          <h2 className="font-bold mb-4">Moderation Queue</h2>
          <div className="space-y-3 text-sm">
            <p className="flex justify-between"><span>Pending artists</span><b>{stats.pendingArtists || 0}</b></p>
            <p className="flex justify-between"><span>Pending songs</span><b>{stats.pendingSongs || 0}</b></p>
            <p className="flex justify-between"><span>Pending albums</span><b>{stats.pendingAlbums || 0}</b></p>
          </div>
        </section>

        <section className="bg-spotify-dark/50 rounded-xl p-5">
          <h2 className="font-bold mb-4">Top Songs</h2>
          <div className="space-y-3">
            {(data?.topSongs || []).map((song) => (
              <div key={song._id} className="flex justify-between gap-3 text-sm">
                <span className="truncate">{song.title}</span>
                <span className="text-spotify-light">{song.plays} plays</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-spotify-dark/50 rounded-xl p-5">
          <h2 className="font-bold mb-4">Trending Genres</h2>
          <div className="space-y-3">
            {(data?.trendingGenres || []).map((genre) => (
              <div key={genre._id} className="flex justify-between gap-3 text-sm">
                <span>{genre._id || "Unknown"}</span>
                <span className="text-spotify-light">{genre.plays} plays</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
