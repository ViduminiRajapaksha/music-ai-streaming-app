import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiClock } from "react-icons/fi";
import { userService } from "../services/userService";
import { normalizeBackendTrack, normalizeLibrarySong } from "../utils/normalize";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import MusicCard from "../components/MusicCard";
import toast from "react-hot-toast";

const normalizeHistoryItem = (item) => {
  if (item.song && typeof item.song === "object" && item.song.title) return normalizeLibrarySong(item.song);
  return normalizeBackendTrack(item);
};

const HistorySection = ({ title, tracks }) => (
  <section>
    <h2 className="section-title">{title}</h2>
    {tracks.length ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {tracks.map((track, index) => (
          <MusicCard key={`${track.id}-${index}`} track={track} index={index} queue={tracks} />
        ))}
      </div>
    ) : (
      <p className="text-spotify-light">No tracks yet.</p>
    )}
  </section>
);

const History = () => {
  const [recent, setRecent] = useState([]);
  const [mostPlayed, setMostPlayed] = useState([]);
  const [continueListening, setContinueListening] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [historyData, mostData, continueData] = await Promise.all([
          userService.getListeningHistory(1, 30),
          userService.getMostPlayed(20),
          userService.getContinueListening(12)
        ]);
        setRecent((historyData.history || []).map(normalizeHistoryItem).filter(Boolean));
        setMostPlayed((mostData || []).map(normalizeHistoryItem).filter(Boolean));
        setContinueListening((continueData || []).map(normalizeHistoryItem).filter(Boolean));
      } catch (err) {
        toast.error(err.message || "Failed to load listening history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner text="Loading listening history..." />;

  const hasAny = recent.length || mostPlayed.length || continueListening.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-spotify-light mt-1">Recently played, most played, and continue listening.</p>
      </div>

      {hasAny ? (
        <>
          <HistorySection title="Continue Listening" tracks={continueListening} />
          <HistorySection title="Most Played" tracks={mostPlayed} />
          <HistorySection title="Recently Played" tracks={recent} />
        </>
      ) : (
        <EmptyState icon={FiClock} title="No listening history yet" description="Songs you play will appear here." />
      )}
    </motion.div>
  );
};

export default History;
