import { motion } from "framer-motion";
import { FiArrowDown, FiArrowUp, FiList, FiPlay, FiTrash2 } from "react-icons/fi";
import { usePlayer } from "../hooks/usePlayer";
import { PLACEHOLDER_IMAGE } from "../utils/constants";
import { formatDuration } from "../utils/formatDuration";
import EmptyState from "../components/EmptyState";

const Queue = () => {
  const {
    queue,
    queueIndex,
    currentTrack,
    playQueue,
    removeFromQueue,
    moveQueueItem
  } = usePlayer();

  if (!queue.length) {
    return <EmptyState icon={FiList} title="Queue is empty" description="Play a song or album to build a queue." />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Queue</h1>
        <p className="text-spotify-light mt-1">{queue.length} tracks queued</p>
      </div>

      {currentTrack && (
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-spotify-light mb-2">Currently Playing</p>
          <div className="flex items-center gap-3">
            <img src={currentTrack.image || PLACEHOLDER_IMAGE} alt="" className="w-12 h-12 rounded object-cover" />
            <div>
              <p className="font-semibold">{currentTrack.title}</p>
              <p className="text-sm text-spotify-light">{currentTrack.artist}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {queue.map((track, index) => {
          const trackId = track.youtubeId || track.id;
          const active = index === queueIndex;
          return (
            <div
              key={`${trackId}-${index}`}
              className={`flex items-center gap-4 p-3 rounded-lg ${active ? "bg-spotify-green/10" : "hover:bg-white/5"}`}
            >
              <span className="w-6 text-sm text-spotify-light">{index + 1}</span>
              <img src={track.image || PLACEHOLDER_IMAGE} alt="" className="w-12 h-12 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{track.title}</p>
                <p className="text-sm text-spotify-light truncate">{track.artist}</p>
              </div>
              <span className="hidden sm:block text-sm text-spotify-light">{formatDuration(track.durationMs)}</span>
              <button onClick={() => playQueue(queue, index)} className="p-2 text-spotify-light hover:text-white" aria-label="Play">
                <FiPlay />
              </button>
              <button onClick={() => moveQueueItem(index, Math.max(0, index - 1))} className="p-2 text-spotify-light hover:text-white" aria-label="Move up">
                <FiArrowUp />
              </button>
              <button onClick={() => moveQueueItem(index, Math.min(queue.length - 1, index + 1))} className="p-2 text-spotify-light hover:text-white" aria-label="Move down">
                <FiArrowDown />
              </button>
              <button onClick={() => removeFromQueue(trackId)} className="p-2 text-spotify-light hover:text-red-400" aria-label="Remove">
                <FiTrash2 />
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Queue;
