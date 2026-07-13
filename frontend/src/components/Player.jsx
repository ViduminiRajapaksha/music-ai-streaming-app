import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiVolumeX,
  FiShuffle,
  FiRepeat,
  FiClock,
  FiList,
  FiSliders,
  FiFileText,
  FiX
} from "react-icons/fi";
import { usePlayer } from "../hooks/usePlayer";
import { useMusic } from "../hooks/useMusic";
import { formatSeconds } from "../utils/formatDuration";
import { REPEAT_MODES, PLACEHOLDER_IMAGE } from "../utils/constants";

const Player = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    playbackRate,
    sleepTimerEndsAt,
    equalizer,
    shuffle,
    repeat,
    isPlayerVisible,
    togglePlay,
    handleNext,
    handlePrevious,
    seek,
    changeVolume,
    changePlaybackRate,
    startSleepTimer,
    updateEqualizer,
    toggleShuffle,
    toggleRepeat,
    clearPlayer
  } = usePlayer();

  const { addToRecentlyPlayed } = useMusic();
  const progressRef = useRef(null);

  useEffect(() => {
    if (currentTrack && isPlaying) {
      addToRecentlyPlayed(currentTrack);
    }
  }, [currentTrack?.youtubeId, isPlaying]);

  if (!isPlayerVisible || !currentTrack) return null;

  const handleProgressClick = (e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  const progressPercent = duration ? (progress / duration) * 100 : 0;
  const sleepMinutesLeft = sleepTimerEndsAt
    ? Math.max(0, Math.ceil((sleepTimerEndsAt - Date.now()) / 60000))
    : 0;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-gray-100 dark:bg-spotify-gray border-t border-gray-200 dark:border-white/10 px-4 py-2 transition-colors duration-300"
    >
      {/* Progress bar */}
      <div
        ref={progressRef}
        className="absolute top-0 left-0 right-0 h-1 bg-white/10 cursor-pointer group"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-spotify-green relative group-hover:bg-[#1ed760] transition-colors"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 max-w-screen-2xl mx-auto pt-1">
        {/* Track info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link to="/now-playing" className="hidden sm:block flex-shrink-0">
            <img
              src={currentTrack.image || PLACEHOLDER_IMAGE}
              alt={currentTrack.title}
              className="w-14 h-14 rounded object-cover"
            />
          </Link>
          <div className="min-w-0">
            <p className="font-medium truncate text-sm">{currentTrack.title}</p>
            <p className="text-spotify-light text-xs truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center flex-1 max-w-md">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`p-1 transition-colors ${shuffle ? "text-spotify-green" : "text-spotify-light hover:text-white"}`}
              aria-label="Shuffle"
            >
              <FiShuffle className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrevious}
              className="text-spotify-light hover:text-white transition-colors p-1"
              aria-label="Previous"
            >
              <FiSkipBack className="w-5 h-5" />
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              disabled={!currentTrack}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center
                         hover:scale-105 transition-transform disabled:opacity-50"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <FiPause className="w-5 h-5 text-black" />
              ) : (
                <FiPlay className="w-5 h-5 text-black ml-0.5" />
              )}
            </motion.button>
            <button
              onClick={handleNext}
              className="text-spotify-light hover:text-white transition-colors p-1"
              aria-label="Next"
            >
              <FiSkipForward className="w-5 h-5" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`p-1 transition-colors relative ${
                repeat !== REPEAT_MODES.OFF ? "text-spotify-green" : "text-spotify-light hover:text-white"
              }`}
              aria-label="Repeat"
            >
              <FiRepeat className="w-4 h-4" />
              {repeat === REPEAT_MODES.ONE && (
                <span className="absolute -top-1 -right-1 text-[8px] font-bold">1</span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-spotify-light mt-1">
            <span>{formatSeconds(progress)}</span>
            <span>/</span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
          <Link to="/lyrics" className="text-spotify-light hover:text-white" aria-label="Lyrics">
            <FiFileText className="w-5 h-5" />
          </Link>
          <Link to="/queue" className="text-spotify-light hover:text-white" aria-label="Queue">
            <FiList className="w-5 h-5" />
          </Link>
          <select
            value={playbackRate}
            onChange={(e) => changePlaybackRate(e.target.value)}
            className="bg-transparent text-xs text-spotify-light border border-white/10 rounded px-1 py-1"
            aria-label="Playback speed"
          >
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
              <option key={rate} value={rate}>{rate}x</option>
            ))}
          </select>
          <select
            value={sleepMinutesLeft ? "active" : ""}
            onChange={(e) => startSleepTimer(e.target.value)}
            className="bg-transparent text-xs text-spotify-light border border-white/10 rounded px-1 py-1"
            aria-label="Sleep timer"
            title={sleepMinutesLeft ? `${sleepMinutesLeft} minutes left` : "Sleep timer"}
          >
            <option value="">Timer</option>
            <option value="15">15m</option>
            <option value="30">30m</option>
            <option value="45">45m</option>
            <option value="60">60m</option>
            {sleepMinutesLeft > 0 && <option value="active">{sleepMinutesLeft}m left</option>}
          </select>
          <details className="relative">
            <summary className="list-none cursor-pointer text-spotify-light hover:text-white" aria-label="Equalizer">
              <FiSliders className="w-5 h-5" />
            </summary>
            <div className="absolute right-0 bottom-8 w-56 rounded-xl bg-spotify-gray border border-white/10 p-4 space-y-3 shadow-xl">
              {["bass", "mid", "treble"].map((band) => (
                <label key={band} className="block text-xs text-spotify-light capitalize">
                  {band}
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={equalizer[band]}
                    onChange={(e) => updateEqualizer(band, e.target.value)}
                    className="w-full accent-spotify-green"
                  />
                </label>
              ))}
            </div>
          </details>
          <FiClock className={`w-4 h-4 ${sleepMinutesLeft ? "text-spotify-green" : "text-spotify-light"}`} />
          <button
            onClick={() => changeVolume(volume > 0 ? 0 : 0.7)}
            className="text-spotify-light hover:text-white"
            aria-label="Toggle mute"
          >
            {volume === 0 ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => changeVolume(parseFloat(e.target.value))}
            className="w-24 accent-spotify-green"
            aria-label="Volume"
          />
        </div>

        <button
          onClick={clearPlayer}
          className="shrink-0 p-2 rounded-full text-spotify-light hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close player"
          title="Close player"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default Player;
