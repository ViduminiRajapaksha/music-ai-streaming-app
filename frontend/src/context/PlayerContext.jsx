import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback
} from "react";
import { REPEAT_MODES } from "../utils/constants";
import { normalizeYouTubeTrack } from "../utils/normalize";
import { API_ORIGIN } from "../utils/constants";

const PlayerContext = createContext(null);
const OFFLINE_KEY = "melodymind_offline_tracks";

const parseLyrics = (lyrics = "") => {
  if (!lyrics.trim()) return [];
  const lines = lyrics.split(/\r?\n/);
  const timedLines = lines
    .map((line, index) => {
      const match = line.match(/^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)$/);
      if (!match) return null;
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const millis = Number((match[3] || "0").padEnd(3, "0"));
      return {
        time: minutes * 60 + seconds + millis / 1000,
        text: match[4],
        index
      };
    })
    .filter(Boolean);

  if (timedLines.length) return timedLines;
  return lines.map((text, index) => ({ time: index * 5, text, index }));
};

export const PlayerProvider = ({ children }) => {
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const handleNextRef = useRef(() => {});
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(REPEAT_MODES.OFF);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [sleepTimerEndsAt, setSleepTimerEndsAt] = useState(null);
  const [equalizer, setEqualizer] = useState({ bass: 0, mid: 0, treble: 0 });
  const [karaokeMode, setKaraokeMode] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsPlayerReady(true);
      };
    } else {
      setIsPlayerReady(true);
    }
  }, []);

  const playerContainerRef = useRef(null);

  const resolveMediaUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_ORIGIN}${url}`;
  };

  // Initialize YouTube player
  useEffect(() => {
    if (!isPlayerReady || playerRef.current || !playerContainerRef.current) return;

    playerRef.current = new window.YT.Player(playerContainerRef.current, {
      height: '0',
      width: '0',
      playerVars: {
        'playsinline': 1,
        'controls': 0,
        'disablekb': 1,
        'fs': 0,
        'modestbranding': 1
      },
      events: {
        'onReady': () => {
          if (playerRef.current) {
            playerRef.current.setVolume(volume * 100);
          }
        },
        'onStateChange': (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === window.YT.PlayerState.ENDED) {
            handleNextRef.current();
          }
        }
      }
    });

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isPlayerReady]);

  // Progress tracking
  useEffect(() => {
    if (currentTrack?.audioURL || !isPlaying || !playerRef.current) return;

    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        setProgress(currentTime);
        if (playerRef.current.getDuration) {
          setDuration(playerRef.current.getDuration() || 0);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTrack?.audioURL, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setProgress(audio.currentTime || 0);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => handleNextRef.current();
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  // Volume control
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume * 100);
    }
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
    if (playerRef.current && playerRef.current.setPlaybackRate) {
      playerRef.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate, currentTrack]);

  useEffect(() => {
    if (!sleepTimerEndsAt) return undefined;

    const timeout = setTimeout(() => {
      if (audioRef.current) audioRef.current.pause();
      if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo();
      setIsPlaying(false);
      setSleepTimerEndsAt(null);
    }, Math.max(0, sleepTimerEndsAt - Date.now()));

    return () => clearTimeout(timeout);
  }, [sleepTimerEndsAt]);

  const playTrack = useCallback(async (track, trackQueue = []) => {
    const normalized = track.youtubeId ? track : normalizeYouTubeTrack(track);
    if (!normalized) return;

    setCurrentTrack(normalized);
    setIsPlayerVisible(true);

    if (trackQueue.length > 0) {
      setQueue(trackQueue);
      const idx = trackQueue.findIndex(
        (t) => (t.youtubeId || t.id) === normalized.youtubeId
      );
      setQueueIndex(idx >= 0 ? idx : 0);
    }

    if (normalized.audioURL && audioRef.current) {
      if (playerRef.current && playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo();
      }
      audioRef.current.src = resolveMediaUrl(normalized.audioURL);
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
      await audioRef.current.play();
      setProgress(0);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
    }

    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(normalized.youtubeId);
      setProgress(0);
    }
  }, [volume, playbackRate]);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;

    if (currentTrack.audioURL && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      return;
    }

    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [currentTrack, isPlaying]);

  const handleNext = useCallback(() => {
    if (queue.length === 0) {
      if (repeat === REPEAT_MODES.ONE && currentTrack) {
        if (currentTrack.audioURL && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        } else if (playerRef.current) {
          playerRef.current.seekTo(0);
          playerRef.current.playVideo();
        }
      }
      return;
    }

    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (queueIndex < queue.length - 1) {
      nextIndex = queueIndex + 1;
    } else if (repeat === REPEAT_MODES.ALL) {
      nextIndex = 0;
    } else {
      setIsPlaying(false);
      return;
    }

    setQueueIndex(nextIndex);
    const nextTrack = queue[nextIndex];
    playTrack(nextTrack, queue);
  }, [queue, queueIndex, shuffle, repeat, currentTrack, playTrack]);

  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  const handlePrevious = useCallback(() => {
    if (currentTrack?.audioURL && audioRef.current) {
      if (audioRef.current.currentTime > 3) {
        audioRef.current.currentTime = 0;
        return;
      }
    } else if (!playerRef.current) {
      return;
    }

    const currentTime = currentTrack?.audioURL ? audioRef.current.currentTime : playerRef.current.getCurrentTime();
    if (currentTime > 3) {
      if (currentTrack?.audioURL && audioRef.current) {
        audioRef.current.currentTime = 0;
      } else {
        playerRef.current.seekTo(0);
      }
      return;
    }

    if (queue.length === 0) return;

    let prevIndex;
    if (shuffle) {
      prevIndex = Math.floor(Math.random() * queue.length);
    } else if (queueIndex > 0) {
      prevIndex = queueIndex - 1;
    } else if (repeat === REPEAT_MODES.ALL) {
      prevIndex = queue.length - 1;
    } else {
      if (currentTrack?.audioURL && audioRef.current) {
        audioRef.current.currentTime = 0;
      } else {
        playerRef.current.seekTo(0);
      }
      return;
    }

    setQueueIndex(prevIndex);
    playTrack(queue[prevIndex], queue);
  }, [queue, queueIndex, shuffle, repeat, playTrack]);

  const seek = useCallback((time) => {
    if (currentTrack?.audioURL && audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
      return;
    }
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(time);
      setProgress(time);
    }
  }, [currentTrack]);

  const changeVolume = useCallback((val) => {
    setVolume(Math.max(0, Math.min(1, val)));
  }, []);

  const changePlaybackRate = useCallback((rate) => {
    setPlaybackRate(Math.max(0.5, Math.min(2, Number(rate) || 1)));
  }, []);

  const startSleepTimer = useCallback((minutes) => {
    const duration = Number(minutes);
    if (!duration) {
      setSleepTimerEndsAt(null);
      return;
    }
    setSleepTimerEndsAt(Date.now() + duration * 60 * 1000);
  }, []);

  const updateEqualizer = useCallback((band, value) => {
    setEqualizer((prev) => ({
      ...prev,
      [band]: Math.max(-10, Math.min(10, Number(value) || 0))
    }));
  }, []);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);

  const toggleRepeat = useCallback(() => {
    setRepeat((r) => {
      if (r === REPEAT_MODES.OFF) return REPEAT_MODES.ALL;
      if (r === REPEAT_MODES.ALL) return REPEAT_MODES.ONE;
      return REPEAT_MODES.OFF;
    });
  }, []);

  const playQueue = useCallback(
    (tracks, startIndex = 0) => {
      const normalized = tracks.map((t) =>
        t.youtubeId ? t : normalizeYouTubeTrack(t)
      );
      setQueue(normalized);
      setQueueIndex(startIndex);
      playTrack(normalized[startIndex], normalized);
    },
    [playTrack]
  );

  const removeFromQueue = useCallback((trackId) => {
    setQueue((prev) => prev.filter((track) => (track.youtubeId || track.id) !== trackId));
  }, []);

  const moveQueueItem = useCallback((fromIndex, toIndex) => {
    setQueue((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  }, []);

  const lyricsLines = parseLyrics(currentTrack?.lyrics || "");
  const activeLyricIndex = lyricsLines.reduce(
    (activeIndex, line, index) => (progress >= line.time ? index : activeIndex),
    -1
  );

  const saveOfflineTrack = useCallback((track) => {
    const normalized = track.youtubeId ? track : normalizeYouTubeTrack(track);
    if (!normalized) return [];
    const stored = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
    const updated = [
      normalized,
      ...stored.filter((item) => (item.youtubeId || item.id) !== (normalized.youtubeId || normalized.id))
    ];
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(updated));
    return updated;
  }, []);

  const getOfflineTracks = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
    } catch {
      return [];
    }
  }, []);

  const clearPlayer = useCallback(() => {
    if (playerRef.current && playerRef.current.stopVideo) {
      playerRef.current.stopVideo();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setIsPlayerVisible(false);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        queueIndex,
        isPlaying,
        progress,
        duration,
        volume,
        playbackRate,
        sleepTimerEndsAt,
        equalizer,
        karaokeMode,
        shuffle,
        repeat,
        isPlayerVisible,
        lyricsLines,
        activeLyricIndex,
        playTrack,
        playQueue,
        togglePlay,
        handleNext,
        handlePrevious,
        seek,
        changeVolume,
        changePlaybackRate,
        startSleepTimer,
        updateEqualizer,
        setKaraokeMode,
        toggleShuffle,
        toggleRepeat,
        removeFromQueue,
        moveQueueItem,
        saveOfflineTrack,
        getOfflineTracks,
        clearPlayer,
        playerRef
      }}
    >
      {children}
      <audio ref={audioRef} preload="metadata" />
      <div ref={playerContainerRef} style={{ display: 'none' }}></div>
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayerContext must be used within PlayerProvider");
  }
  return context;
};
