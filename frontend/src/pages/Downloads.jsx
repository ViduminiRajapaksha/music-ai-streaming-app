import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiDownload, FiTrash2 } from "react-icons/fi";
import { downloadService } from "../services/downloadService";
import { normalizeLibrarySong } from "../utils/normalize";
import { usePlayer } from "../hooks/usePlayer";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import MusicCard from "../components/MusicCard";
import toast from "react-hot-toast";

const Downloads = () => {
  const [downloads, setDownloads] = useState([]);
  const [offlineTracks, setOfflineTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getOfflineTracks } = usePlayer();

  const load = async () => {
    try {
      const data = await downloadService.getAll();
      setDownloads(data);
      setOfflineTracks(getOfflineTracks());
    } catch (err) {
      toast.error(err.message || "Failed to load downloads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeDownload = async (songId) => {
    try {
      await downloadService.remove(songId);
      setDownloads((prev) => prev.filter((item) => item.song?._id !== songId));
      toast.success("Removed from downloads");
    } catch (err) {
      toast.error(err.message || "Failed to remove download");
    }
  };

  if (loading) return <LoadingSpinner text="Loading downloads..." />;

  const tracks = downloads.map((item) => normalizeLibrarySong(item.song)).filter(Boolean);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Downloads</h1>
        <p className="text-spotify-light mt-1">Premium downloads and offline listening cache.</p>
      </div>

      {tracks.length ? (
        <section>
          <h2 className="section-title">Downloaded Songs</h2>
          <div className="space-y-2">
            {tracks.map((track, index) => (
              <div key={track.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <MusicCard track={track} index={index} queue={tracks} />
                </div>
                <button
                  onClick={() => removeDownload(track._id)}
                  className="p-3 text-spotify-light hover:text-red-400"
                  aria-label="Remove download"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState icon={FiDownload} title="No downloads yet" description="Premium song downloads will appear here." />
      )}

      {offlineTracks.length > 0 && (
        <section>
          <h2 className="section-title">Offline Mode Cache</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {offlineTracks.map((track, index) => (
              <MusicCard key={`${track.id}-${index}`} track={track} index={index} queue={offlineTracks} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default Downloads;
