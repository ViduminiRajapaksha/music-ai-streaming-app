import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiTrash2, FiUsers } from "react-icons/fi";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers(filter ? { search: filter } : {});
      setUsers(data.users || []);
    } catch (err) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateUser = async (id, changes) => {
    try {
      const user = await adminService.updateUser(id, changes);
      setUsers((prev) => prev.map((item) => item._id === id ? user : item));
      toast.success("User updated");
    } catch (err) {
      toast.error(err.message || "Failed to update user");
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((item) => item._id !== id));
      toast.success("User deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><FiUsers className="text-spotify-green" /> Users</h1>
          <p className="text-spotify-light mt-1">View, suspend, promote, and manage premium subscriptions.</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-2">
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search users" className="input-field" />
          <button className="btn-primary">Search</button>
        </form>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-spotify-dark/50 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-spotify-light">
              <tr><th className="p-3">User</th><th>Role</th><th>Status</th><th>Premium</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t border-white/5">
                  <td className="p-3">
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs text-spotify-light">{user.email}</p>
                  </td>
                  <td>
                    <select value={user.role} onChange={(e) => updateUser(user._id, { role: e.target.value })} className="bg-transparent border border-white/10 rounded px-2 py-1">
                      <option value="listener">listener</option>
                      <option value="artist">artist</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <select value={user.status || "active"} onChange={(e) => updateUser(user._id, { status: e.target.value })} className="bg-transparent border border-white/10 rounded px-2 py-1">
                      <option value="active">active</option>
                      <option value="suspended">suspended</option>
                    </select>
                  </td>
                  <td>
                    <select value={user.subscription} onChange={(e) => updateUser(user._id, { subscription: e.target.value })} className="bg-transparent border border-white/10 rounded px-2 py-1">
                      <option value="free">free</option>
                      <option value="premium">premium</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => deleteUser(user._id)} className="p-2 text-spotify-light hover:text-red-400" aria-label="Delete user">
                      <FiTrash2 />
                    </button>
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

export default AdminUsers;
