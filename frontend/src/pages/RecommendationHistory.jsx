import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiClock, FiStar, FiTrash2 } from "react-icons/fi";
import { userService } from "../services/userService";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatDateTime } from "../utils/formatDate";
import toast from "react-hot-toast";

const sourceLabel = (source) => {
  if (source === "youtube-api") return "YouTube API";
  if (source === "local-library") return "Local library";
  if (source === "user-listening-history") return "User listening history";
  return source || "Recommendation";
};

const sourceClass = (source) => {
  if (source === "youtube-api") return "bg-blue-500/20 text-blue-200";
  if (source === "local-library") return "bg-spotify-green/20 text-spotify-green";
  if (source === "user-listening-history") return "bg-amber-500/20 text-amber-200";
  return "bg-white/10 text-spotify-light";
};

const moodSourceLabel = (source) => (
  source === "gemini" ? "Gemini mood analysis" : "Fallback mood profile"
);

const RecommendationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setHistory(await userService.getRecommendationHistory(50));
      } catch (err) {
        toast.error(err.message || "Could not load recommendation history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleDelete = async (entryId) => {
    if (!window.confirm("Delete this recommendation history entry?")) return;

    setDeletingId(entryId);
    try {
      await userService.deleteRecommendationHistory(entryId);
      setHistory((prev) => prev.filter((entry) => entry._id !== entryId));
      toast.success("Recommendation history deleted");
    } catch (err) {
      toast.error(err.message || "Could not delete recommendation history.");
    } finally {
      setDeletingId("");
    }
  };

  if (loading) return <LoadingSpinner text="Loading recommendation history..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FiClock className="text-spotify-green" /> Recommendation History
        </h1>
        <p className="text-spotify-light mt-1">Previous AI recommendations with their data sources.</p>
      </div>

      {history.length ? (
        <div className="space-y-4">
          {history.map((entry) => {
            const moodSource = entry.metadata?.sources?.moodAnalysis;
            return (
              <div key={entry._id} className="glass rounded-xl p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium capitalize">
                        {entry.type?.replace("-", " ")}
                      </span>
                      {entry.mood && (
                        <span className="rounded-full bg-spotify-green/20 px-3 py-1 text-xs font-medium text-spotify-green">
                          {entry.mood}
                        </span>
                      )}
                      {moodSource && (
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          moodSource === "gemini" ? "bg-purple-500/20 text-purple-200" : "bg-yellow-500/20 text-yellow-200"
                        }`}>
                          {moodSourceLabel(moodSource)}
                        </span>
                      )}
                    </div>
                    <h2 className="font-semibold truncate">{entry.prompt || "Personalized recommendations"}</h2>
                    <p className="text-sm text-spotify-light">{formatDateTime(entry.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry._id)}
                    disabled={deletingId === entry._id}
                    className="self-start rounded-full p-2 text-spotify-light transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Delete recommendation history"
                    title="Delete recommendation history"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 divide-y divide-white/10">
                  {(entry.recommendations || []).slice(0, 8).map((item, index) => (
                    <div key={`${item.title}-${index}`} className="flex items-start justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{item.title || "Untitled track"}</p>
                        <p className="text-sm text-spotify-light truncate">{item.artist || "Unknown Artist"}</p>
                        {item.reason && <p className="text-xs text-spotify-green/80 mt-1 line-clamp-2">{item.reason}</p>}
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${sourceClass(item.source)}`}>
                        {sourceLabel(item.source)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FiStar}
          title="No recommendation history yet"
          description="Use Smart Search, AI Playlist, or AI Recommendations to build your history."
        />
      )}
    </motion.div>
  );
};

export default RecommendationHistory;
