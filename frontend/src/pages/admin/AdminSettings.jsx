import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiSettings } from "react-icons/fi";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setSettings(await adminService.getSettings());
      } catch (err) {
        toast.error(err.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner text="Loading admin settings..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3"><FiSettings className="text-spotify-green" /> Admin Settings</h1>
        <p className="text-spotify-light mt-1">System configuration used by dashboard analytics and moderation.</p>
      </div>

      <section className="bg-spotify-dark/50 rounded-xl p-5 space-y-4">
        <h2 className="font-bold">Premium Management</h2>
        <label className="block">
          <span className="text-sm text-spotify-light">Monthly price estimate</span>
          <input value={settings?.premiumMonthlyPrice ?? ""} readOnly className="input-field mt-1" />
        </label>
        <p className="text-sm text-spotify-light">
          Revenue is estimated from premium user count. Change `PREMIUM_MONTHLY_PRICE` on the backend to adjust this value.
        </p>
      </section>

      <section className="bg-spotify-dark/50 rounded-xl p-5">
        <h2 className="font-bold mb-4">Moderation Defaults</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <p className="flex justify-between bg-black/20 rounded-lg p-3"><span>Songs</span><b>{settings?.moderationDefaults?.songs}</b></p>
          <p className="flex justify-between bg-black/20 rounded-lg p-3"><span>Albums</span><b>{settings?.moderationDefaults?.albums}</b></p>
          <p className="flex justify-between bg-black/20 rounded-lg p-3"><span>Artists</span><b>{settings?.moderationDefaults?.artists}</b></p>
        </div>
      </section>

      <section className="bg-spotify-dark/50 rounded-xl p-5">
        <h2 className="font-bold mb-4">Analytics</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <p className="flex justify-between bg-black/20 rounded-lg p-3"><span>Window</span><b>{settings?.analyticsWindowDays} days</b></p>
          <p className="flex justify-between bg-black/20 rounded-lg p-3"><span>Currency</span><b>{settings?.revenueCurrency}</b></p>
        </div>
      </section>
    </motion.div>
  );
};

export default AdminSettings;
