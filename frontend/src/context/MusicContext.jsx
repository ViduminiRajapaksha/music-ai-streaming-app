import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { musicService } from "../services/musicService";
import { favoriteService } from "../services/favoriteService";
import { userService } from "../services/userService";
import { libraryService } from "../services/libraryService";
import { normalizeYouTubeTrack, normalizeLibrarySong, normalizeBackendTrack, trackToFavoritePayload } from "../utils/normalize";
import { useAuthContext } from "./AuthContext";
import toast from "react-hot-toast";

const MusicContext = createContext(null);
const RECENT_KEY = "melodymind_recent";

export const MusicProvider = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [homeLoading, setHomeLoading] = useState(false);
  const [homeWarning, setHomeWarning] = useState("");

  // Load recently played from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecentlyPlayed(JSON.parse(stored));
    } catch {
      setRecentlyPlayed([]);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }
    setFavoritesLoading(true);
    try {
      const data = await favoriteService.getAll();
      setFavorites(data.map(normalizeBackendTrack));
    } catch (err) {
      toast.error(err.message || "Failed to load favorites");
    } finally {
      setFavoritesLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const loadHomeData = useCallback(async () => {
    setHomeLoading(true);
    setHomeWarning("");
    try {
      const [releasesResult, recsResult] = await Promise.allSettled([
        musicService.getNewReleases(12),
        musicService.getRecommendations({ limit: 12 })
      ]);

      const releases = releasesResult.status === "fulfilled" ? releasesResult.value : null;
      const recs = recsResult.status === "fulfilled" ? recsResult.value : null;
      let nextReleases = releases?.albums?.items || releases?.tracks || [];
      let nextRecommendations = recs?.tracks || [];

      if (!nextReleases.length || !nextRecommendations.length) {
        const fallback = await libraryService.getTrending(12);
        const localTracks = (fallback.songs || []).map(normalizeLibrarySong).filter(Boolean);
        if (!nextReleases.length) nextReleases = localTracks;
        if (!nextRecommendations.length) nextRecommendations = localTracks;
      }

      setNewReleases(nextReleases);
      setRecommendations(nextRecommendations);

      const warning = releases?.warning || recs?.warning;
      if (warning) {
        setHomeWarning(warning);
        toast.error(warning);
      }
    } catch (err) {
      const message = err.message || "Music data is temporarily unavailable. Try again later or upload local songs.";
      setHomeWarning(message);
      toast.error(message);
    } finally {
      setHomeLoading(false);
    }
  }, []);

  const addToRecentlyPlayed = useCallback(
    async (track) => {
      const normalized = track.youtubeId ? track : normalizeYouTubeTrack(track);
      if (!normalized) return;

      setRecentlyPlayed((prev) => {
        const updated = [
          normalized,
          ...prev.filter((t) => t.youtubeId !== normalized.youtubeId)
        ].slice(0, 20);
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
        return updated;
      });

      if (isAuthenticated) {
        try {
          await userService.recordListening({
            youtubeId: normalized.youtubeId,
            title: normalized.title,
            artist: normalized.artist,
            album: normalized.album,
            image: normalized.image,
            previewUrl: normalized.previewUrl,
            durationMs: normalized.durationMs
          });
        } catch {
          // Silent fail for listening history sync
        }
      }
    },
    [isAuthenticated]
  );

  const isFavorite = useCallback(
    (trackId) => favorites.some((f) => f.youtubeId === trackId || f.id === trackId),
    [favorites]
  );

  const getFavoriteId = useCallback(
    (trackId) => {
      const fav = favorites.find((f) => f.youtubeId === trackId || f.id === trackId);
      return fav?._id || fav?.id;
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (track) => {
      if (!isAuthenticated) {
        toast.error("Please login to save favorites");
        return;
      }

      const trackId = track.youtubeId || track.id;
      const existingFav = favorites.find(
        (f) => f.youtubeId === trackId || f.id === trackId
      );

      try {
        if (existingFav?._id) {
          await favoriteService.remove(existingFav._id);
          setFavorites((prev) => prev.filter((f) => f._id !== existingFav._id));
          toast.success("Removed from favorites");
        } else {
          const payload = trackToFavoritePayload(
            track.youtubeId ? track : normalizeYouTubeTrack(track)
          );
          const added = await favoriteService.add(payload);
          setFavorites((prev) => [normalizeBackendTrack(added), ...prev]);
          toast.success("Added to favorites");
        }
      } catch (err) {
        toast.error(err.message || "Failed to update favorites");
      }
    },
    [isAuthenticated, favorites]
  );

  const searchMusic = useCallback(async (query, type = "track") => {
    const data = await musicService.search(query, type);
    return data;
  }, []);

  return (
    <MusicContext.Provider
      value={{
        favorites,
        favoritesLoading,
        recentlyPlayed,
        newReleases,
        recommendations,
        homeLoading,
        homeWarning,
        loadFavorites,
        loadHomeData,
        addToRecentlyPlayed,
        isFavorite,
        toggleFavorite,
        searchMusic
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusicContext must be used within MusicProvider");
  }
  return context;
};
