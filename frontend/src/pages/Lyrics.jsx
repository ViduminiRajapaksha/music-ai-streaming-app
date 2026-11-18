import { motion } from "framer-motion";
import { FiFileText, FiMic } from "react-icons/fi";
import { usePlayer } from "../hooks/usePlayer";
import EmptyState from "../components/EmptyState";
import PageHero from "../components/PageHero";

const Lyrics = () => {
  const {
    currentTrack,
    lyricsLines,
    activeLyricIndex,
    karaokeMode,
    setKaraokeMode
  } = usePlayer();

  if (!currentTrack) {
    return <EmptyState icon={FiFileText} title="No song playing" description="Start a song to view lyrics." />;
  }

  if (!lyricsLines.length) {
    return <EmptyState icon={FiFileText} title="No lyrics available" description="Uploaded lyrics will appear here." />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <PageHero
        eyebrow="Now playing"
        title="Lyrics"
        description={`${currentTrack.title} - ${currentTrack.artist}`}
        stat={`${lyricsLines.length} lines`}
        icon={FiFileText}
        action={
          <button
          onClick={() => setKaraokeMode(!karaokeMode)}
          className={`btn-secondary flex items-center gap-2 ${karaokeMode ? "text-spotify-green" : ""}`}
        >
          <FiMic /> Karaoke Mode
        </button>
        }
      />

      <div className={`rounded-2xl p-6 ${karaokeMode ? "bg-black" : "glass"}`}>
        <div className="space-y-3 text-center">
          {lyricsLines.map((line, index) => {
            const active = index === activeLyricIndex;
            const passed = index < activeLyricIndex;
            return (
              <p
                key={`${line.time}-${index}`}
                className={`transition-all duration-300 ${
                  active
                    ? "text-3xl md:text-5xl font-extrabold text-spotify-green"
                    : passed
                      ? "text-lg text-white/40"
                      : "text-xl text-spotify-light"
                }`}
              >
                {line.text || "..."}
              </p>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default Lyrics;
