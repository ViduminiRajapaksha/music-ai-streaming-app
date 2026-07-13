import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiDownload, FiFileText, FiList, FiPause, FiPlay } from "react-icons/fi";
import { usePlayer } from "../hooks/usePlayer";
import { libraryService } from "../services/libraryService";
import { API_ORIGIN, PLACEHOLDER_IMAGE } from "../utils/constants";
import { formatSeconds } from "../utils/formatDuration";
import toast from "react-hot-toast";

const NowPlaying = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    togglePlay,
    seek,
    lyricsLines,
    activeLyricIndex,
    saveOfflineTrack
  } = usePlayer();

  const downloadTrack = async () => {
    if (!currentTrack?._id) {
      saveOfflineTrack(currentTrack);
      toast.success("Saved for offline metadata");
      return;
    }
    try {
      const url = await libraryService.downloadSong(currentTrack._id);
      saveOfflineTrack(currentTrack);
      const resolved = /^https?:\/\//i.test(url) ? url : `${API_ORIGIN}${url}`;
      window.open(resolved, "_blank", "noopener,noreferrer");
      toast.success("Download started");
    } catch (err) {
      toast.error(err.message || "Download failed");
    }
  };

  if (!currentTrack) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold">Now Playing</h1>
        <p className="text-spotify-light mt-2">Start a song to see the full player.</p>
      </div>
    );
  }

  const progressPercent = duration ? (progress / duration) * 100 : 0;
  const activeLine = lyricsLines[activeLyricIndex]?.text;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8">
      <div className="grid md:grid-cols-[320px_1fr] gap-8 items-end">
        <img
          src={currentTrack.image || PLACEHOLDER_IMAGE}
          alt={currentTrack.title}
          className="w-full max-w-80 aspect-square rounded-xl object-cover shadow-2xl mx-auto"
        />
        <div className="space-y-5">
          <p className="text-spotify-light text-sm uppercase">Now Playing</p>
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold">{currentTrack.title}</h1>
            <p className="text-xl text-spotify-light mt-2">{currentTrack.artist}</p>
            {currentTrack.album && <p className="text-spotify-light mt-1">{currentTrack.album}</p>}
          </div>

          <div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full accent-spotify-green"
            />
            <div className="flex justify-between text-xs text-spotify-light">
              <span>{formatSeconds(progress)}</span>
              <span>{Math.round(progressPercent)}%</span>
              <span>{formatSeconds(duration)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={togglePlay} className="btn-primary flex items-center gap-2">
              {isPlaying ? <FiPause /> : <FiPlay />} {isPlaying ? "Pause" : "Play"}
            </button>
            <Link to="/lyrics" className="btn-secondary flex items-center gap-2"><FiFileText /> Lyrics</Link>
            <Link to="/queue" className="btn-secondary flex items-center gap-2"><FiList /> Queue</Link>
            <button onClick={downloadTrack} className="btn-secondary flex items-center gap-2"><FiDownload /> Download</button>
          </div>
        </div>
      </div>

      {activeLine && (
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-2xl font-bold text-spotify-green">{activeLine}</p>
        </div>
      )}
    </motion.div>
  );
};

export default NowPlaying;
