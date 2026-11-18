import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import PageHero from "../components/PageHero";
import toast from "react-hot-toast";
import { FiLock, FiSettings } from "react-icons/fi";

const Settings = () => {
  const { changePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to permanently delete your account? This cannot be undone.")) {
      return;
    }
    try {
      await deleteAccount();
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Failed to delete account");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl space-y-8">
      <PageHero
        eyebrow="Account Controls"
        title="Settings"
        description="Manage sign-in security and account actions."
        stat="Keep your MelodyMind account current"
        icon={FiSettings}
      />

      <div className="rounded-lg bg-white/[0.06] p-6 ring-1 ring-white/10">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <FiLock className="text-spotify-green" /> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <input
            type="password"
            placeholder="Current password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder="New password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            className="input-field"
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            className="input-field"
            required
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-red-500/20 bg-red-500/[0.04] p-6">
        <h2 className="text-xl font-bold mb-2 text-red-400">Danger Zone</h2>
        <p className="text-spotify-light text-sm mb-4">
          Permanently delete your account and all associated data.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="w-full py-2.5 rounded-full border border-red-500 text-red-400 font-semibold
                     hover:bg-red-500/10 transition-colors"
        >
          Delete Account
        </button>
      </div>
    </motion.div>
  );
};

export default Settings;
