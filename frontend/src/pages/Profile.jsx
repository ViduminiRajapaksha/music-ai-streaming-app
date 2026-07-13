import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/userService";
import { API_ORIGIN, GENRES } from "../utils/constants";
import { formatRelativeTime } from "../utils/formatDate";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Profile = () => {
  const { user, updateProfile, uploadProfileImage } = useAuth();
  const [listeningHistory, setListeningHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    username: "",
    profileImage: "",
    favoriteGenres: []
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        profileImage: user.profileImage || "",
        favoriteGenres: user.favoriteGenres || []
      });
    }
  }, [user]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await userService.getListeningHistory(1, 30);
        setListeningHistory(data.history || []);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const handleSave = async () => {
    try {
      await updateProfile(form);
      setEditMode(false);
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const getProfileImageSrc = (profileImage) => {
    if (!profileImage) return "";
    if (/^https?:\/\//i.test(profileImage)) return profileImage;
    return `${API_ORIGIN}${profileImage}`;
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const profileImage = await uploadProfileImage(file);
      setForm((prev) => ({ ...prev, profileImage }));
    } catch (err) {
      toast.error(err.message || "Failed to upload profile image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const toggleGenre = (genre) => {
    setForm((prev) => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter((g) => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const genreChartData = {
    labels: form.favoriteGenres.length ? form.favoriteGenres : ["No genres selected"],
    datasets: [
      {
        data: form.favoriteGenres.length ? form.favoriteGenres.map(() => 1) : [1],
        backgroundColor: [
          "#1DB954", "#1ed760", "#169c46", "#535353", "#b3b3b3",
          "#8b5cf6", "#3b82f6", "#f59e0b", "#ef4444", "#ec4899"
        ]
      }
    ]
  };

  const listeningChartData = {
    labels: listeningHistory.slice(0, 7).map((h) => h.title?.slice(0, 15) || "Track"),
    datasets: [
      {
        label: "Recent Plays",
        data: listeningHistory.slice(0, 7).map(() => 1),
        backgroundColor: "#1DB954"
      }
    ]
  };

  if (!user) return <LoadingSpinner />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-6">
        {user.profileImage ? (
          <img
            src={getProfileImageSrc(user.profileImage)}
            alt={user.username}
            className="w-24 h-24 rounded-full object-cover bg-spotify-green"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-spotify-green flex items-center justify-center text-black text-3xl font-bold">
            {user.username?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">{user.username}</h1>
          <p className="text-spotify-light">{user.email}</p>
          <p className="text-spotify-light text-sm mt-1">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Profile Info</h2>
          <button
            onClick={() => (editMode ? handleSave() : setEditMode(true))}
            className="btn-secondary text-sm !py-1.5 !px-4"
          >
            {editMode ? "Save" : "Edit"}
          </button>
        </div>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Profile Image URL</label>
              <input
                value={form.profileImage}
                onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                className="input-field"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Upload Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                disabled={uploadingImage}
                className="input-field file:mr-4 file:rounded-full file:border-0 file:bg-spotify-green file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
              />
              {uploadingImage && (
                <p className="text-sm text-spotify-light mt-2">Uploading image...</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-spotify-light">
            <p><span className="text-white font-medium">Username:</span> {user.username}</p>
            <p><span className="text-white font-medium">Email:</span> {user.email}</p>
          </div>
        )}
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Favorite Genres</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => editMode && toggleGenre(genre)}
              disabled={!editMode}
              className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${
                form.favoriteGenres.includes(genre)
                  ? "bg-spotify-green text-black font-medium"
                  : "bg-white/10 text-spotify-light"
              } ${editMode ? "hover:scale-105 cursor-pointer" : "cursor-default"}`}
            >
              {genre}
            </button>
          ))}
        </div>
        {form.favoriteGenres.length > 0 && (
          <div className="max-w-xs mx-auto">
            <Doughnut data={genreChartData} options={{ plugins: { legend: { labels: { color: "#b3b3b3" } } } }} />
          </div>
        )}
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Listening Analytics</h2>
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : listeningHistory.length > 0 ? (
          <>
            <div className="h-48 mb-6">
              <Bar
                data={listeningChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: "#b3b3b3" }, grid: { color: "#282828" } },
                    y: { ticks: { color: "#b3b3b3" }, grid: { color: "#282828" } }
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              {listeningHistory.slice(0, 10).map((item) => (
                <div key={item._id} className="flex justify-between text-sm py-2 border-b border-white/5">
                  <span className="truncate">{item.title} — {item.artist}</span>
                  <span className="text-spotify-light flex-shrink-0 ml-4">
                    {formatRelativeTime(item.playedAt)}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-spotify-light text-center py-8">No listening history yet. Start playing music!</p>
        )}
      </div>
    </motion.div>
  );
};

export default Profile;
