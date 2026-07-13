import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiRefreshCw, FiStar } from "react-icons/fi";
import { aiService } from "../services/aiService";
import { normalizeLibrarySong } from "../utils/normalize";
import RecommendationCard from "../components/RecommendationCard";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const sourceMeta = {
  ai: { label: "Gemini analysis", type: "gemini" },
  mood: { label: "Gemini mood analysis", type: "gemini" },
  history: { label: "User listening history", type: "history" },
  genre: { label: "Local library", type: "local" },
  search: { label: "Local library", type: "local" },
  lyrics: { label: "Local library", type: "local" }
};

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecommendations = async () => {
    try {
      const data = await aiService.getScoredRecommendations(30);
      setRecommendations(data);
    } catch (err) {
      toast.error(err.message || "Could not load recommendations from your history/local library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const refreshAI = async () => {
    setRefreshing(true);
    try {
      const data = await aiService.recommend(undefined, true);
      setAnalysis(data.aiAnalysis);
      if (data.warnings?.length) {
        toast.error(data.warnings[0]);
      }
      await loadRecommendations();
      toast.success("Recommendations refreshed");
    } catch (err) {
      toast.error(err.message || "Could not refresh recommendations. Check Gemini/YouTube API availability.");
    } finally {
      setRefreshing(false);
    }
  };

  const tracks = recommendations
    .map((item) => ({
      recommendation: item,
      track: normalizeLibrarySong(item.song)
    }))
    .filter((item) => item.track);

  if (loading) return <LoadingSpinner text="Loading AI recommendations..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FiStar className="text-spotify-green" /> AI Recommendations
          </h1>
          <p className="text-spotify-light mt-1">
            Personalized from listening history, favorite genres, time, device, and activity signals.
          </p>
        </div>
        <button
          onClick={refreshAI}
          disabled={refreshing}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Learning..." : "Refresh AI Picks"}
        </button>
      </div>

      {analysis && (
        <div className="glass rounded-xl p-5">
          <h2 className="font-bold mb-2">Assistant Notes</h2>
          <p className="text-spotify-light">{analysis.summary || analysis.explanation}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {analysis.genres?.map((genre) => (
              <span key={genre} className="px-3 py-1 rounded-full bg-spotify-green/20 text-spotify-green text-sm">
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {tracks.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map(({ recommendation, track }, index) => {
            const source = sourceMeta[recommendation.source] || { label: "Local library", type: "local" };
            return (
              <RecommendationCard
                key={recommendation._id}
                track={track}
                reason={`${recommendation.reason || "AI recommended"} - score ${recommendation.score}/100`}
                sourceLabel={source.label}
                sourceType={source.type}
                index={index}
                queue={tracks.map((item) => item.track)}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FiStar}
          title="No recommendations yet"
          description="Play songs, choose favorite genres, or refresh AI picks to build your recommendation profile."
          action={<button onClick={refreshAI} className="btn-primary">Generate Recommendations</button>}
        />
      )}
    </motion.div>
  );
};

export default AIRecommendations;
