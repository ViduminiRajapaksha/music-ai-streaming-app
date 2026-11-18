import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { libraryService } from "../services/libraryService";
import { musicService } from "../services/musicService";
import {
  normalizeLibraryArtist,
  normalizeLibraryAlbum,
  normalizeLibraryPodcast,
  normalizeLibrarySong,
  normalizeYouTubeAlbum,
  normalizeYouTubeArtist,
  normalizeYouTubeTrack
} from "../utils/normalize";
import MusicCard from "../components/MusicCard";
import ArtistCard from "../components/ArtistCard";
import AlbumCard from "../components/AlbumCard";
import SearchBar from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { GENRES } from "../utils/constants";
import { FiDisc, FiHeadphones, FiMic, FiMusic, FiRadio, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";

const TABS = [
  { id: "songs", label: "Songs" },
  { id: "albums", label: "Albums" },
  { id: "artists", label: "Artists" },
  { id: "podcasts", label: "Podcasts" }
];

const MOODS = ["Happy", "Sad", "Energetic", "Calm", "Romantic", "Focus", "Party", "Chill"];
const DISCOVERY_CHIPS = [
  { label: "Sinhala", icon: FiRadio, genre: "Sinhala" },
  { label: "Pop", icon: FiMusic, genre: "Pop" },
  { label: "Chill", icon: FiHeadphones, mood: "Chill" },
  { label: "Party", icon: FiDisc, mood: "Party" },
  { label: "Focus", icon: FiMic, mood: "Focus" }
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [genre, setGenre] = useState(searchParams.get("genre") || "");
  const [mood, setMood] = useState(searchParams.get("mood") || "");
  const [activeTab, setActiveTab] = useState("songs");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const didSearchFromParams = useRef(false);

  const performSearch = useCallback(async ({ q = query, selectedGenre = genre, selectedMood = mood } = {}) => {
    if (!q.trim() && !selectedGenre && !selectedMood) return;
    setLoading(true);
    try {
      let libraryData = { songs: [], albums: [], artists: [], podcasts: [] };
      let youtubeData = { tracks: { items: [] }, albums: { items: [] }, artists: { items: [] } };

      // Search local library
      if (selectedGenre || selectedMood || q.trim()) {
        libraryData = await libraryService.search({
          query: q.trim() || undefined,
          genre: selectedGenre || undefined,
          mood: selectedMood || undefined
        });
      }

      // Search YouTube if there's a text query
      if (q.trim()) {
        try {
          youtubeData = await musicService.search(q.trim(), "track,artist,album", 20);
          if (youtubeData.warning) toast.error(youtubeData.warning);
        } catch (youtubeErr) {
          toast.error(youtubeErr.message || "YouTube search is unavailable. Showing local library results only.");
          // Continue with library results only
        }
      }

      // Combine results
      const combinedResults = {
        songs: [
          ...(libraryData.songs || []).map(normalizeLibrarySong).filter(Boolean),
          ...(youtubeData.tracks?.items || []).map(normalizeYouTubeTrack).filter(Boolean)
        ],
        albums: [
          ...(libraryData.albums || []).map(normalizeLibraryAlbum).filter(Boolean),
          ...(youtubeData.albums?.items || []).map(normalizeYouTubeAlbum).filter(Boolean)
        ],
        artists: [
          ...(libraryData.artists || []).map(normalizeLibraryArtist).filter(Boolean),
          ...(youtubeData.artists?.items || []).map(normalizeYouTubeArtist).filter(Boolean)
        ],
        podcasts: (libraryData.podcasts || []).map(normalizeLibraryPodcast).filter(Boolean)
      };

      setResults(combinedResults);

      const nextParams = {};
      if (q.trim()) nextParams.q = q.trim();
      if (selectedGenre) nextParams.genre = selectedGenre;
      if (selectedMood) nextParams.mood = selectedMood;
      setSearchParams(nextParams);
    } catch (err) {
      toast.error(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }, [genre, mood, query, setSearchParams]);

  useEffect(() => {
    if (didSearchFromParams.current) return;
    didSearchFromParams.current = true;
    const q = searchParams.get("q");
    const selectedGenre = searchParams.get("genre") || "";
    const selectedMood = searchParams.get("mood") || "";
    if (q || selectedGenre || selectedMood) {
      setQuery(q || "");
      setGenre(selectedGenre);
      setMood(selectedMood);
      performSearch({ q: q || "", selectedGenre, selectedMood });
    }
  }, [performSearch, searchParams]);

  const handleSearch = (q) => {
    setQuery(q);
    performSearch({ q });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const songs = (results?.songs || []).map(normalizeLibrarySong).filter(Boolean);
  const albums = (results?.albums || []).map(normalizeLibraryAlbum).filter(Boolean);
  const podcasts = (results?.podcasts || []).map(normalizeLibraryPodcast).filter(Boolean);
  const artists = results?.artists || [];
  const resultCounts = {
    songs: songs.length,
    albums: albums.length,
    artists: artists.length,
    podcasts: podcasts.length
  };

  const runDiscovery = (chip) => {
    const nextGenre = chip.genre || "";
    const nextMood = chip.mood || "";
    setQuery("");
    setGenre(nextGenre);
    setMood(nextMood);
    setActiveTab("songs");
    performSearch({ q: "", selectedGenre: nextGenre, selectedMood: nextMood });
  };

  return (
    <div className="space-y-7">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-gradient-to-br from-white/[0.08] to-transparent p-6 ring-1 ring-white/10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-spotify-green">Explore</p>
        <h1 className="mb-4 text-4xl font-black">Search your sound</h1>
        <p className="mb-6 max-w-2xl text-spotify-light">
          Find songs, albums, artists, and podcasts from your library and discovery results.
        </p>
        <div className="max-w-3xl">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search songs, artists, albums..."
            autoFocus
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {DISCOVERY_CHIPS.map((chip) => {
            const Icon = chip.icon;
            return (
              <button
                key={chip.label}
                onClick={() => runDiscovery(chip)}
                className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-spotify-green hover:text-black"
              >
                <Icon className="h-4 w-4" />
                {chip.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="grid gap-3 rounded-lg bg-white/[0.04] p-3 ring-1 ring-white/10 sm:grid-cols-2">
        <select
          value={genre}
          onChange={(e) => {
            setGenre(e.target.value);
            performSearch({ selectedGenre: e.target.value });
          }}
          className="input-field"
        >
          <option value="">All genres</option>
          {GENRES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select
          value={mood}
          onChange={(e) => {
            setMood(e.target.value);
            performSearch({ selectedMood: e.target.value });
          }}
          className="input-field"
        >
          <option value="">All moods</option>
          {MOODS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      {(query || genre || mood) && (
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-black"
                  : "bg-white/[0.08] text-spotify-light hover:bg-white/[0.12] hover:text-white"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-70">{resultCounts[tab.id] || 0}</span>
            </button>
          ))}
        </div>
      )}

      {loading && <LoadingSpinner text="Searching..." />}

      {!loading && results && activeTab === "songs" && (
        songs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {songs.map((track, i) => (
              <MusicCard key={track.id} track={track} index={i} queue={songs} />
            ))}
          </div>
        ) : (
          <EmptyState title="No songs found" description={`No results for "${query}"`} icon={FiSearch} />
        )
      )}

      {!loading && results && activeTab === "artists" && (
        artists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artists.map((artist, i) => (
              <ArtistCard key={artist.id} artist={artist} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState title="No artists found" description={`No results for "${query}"`} icon={FiSearch} />
        )
      )}

      {!loading && results && activeTab === "albums" && (
        albums.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {albums.map((album, i) => (
              <AlbumCard key={album.id} album={album} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState title="No albums found" description={`No results for "${query}"`} icon={FiSearch} />
        )
      )}

      {!loading && results && activeTab === "podcasts" && (
        podcasts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {podcasts.map((podcast, i) => (
              <MusicCard key={podcast.id} track={podcast} index={i} queue={podcasts} />
            ))}
          </div>
        ) : (
          <EmptyState title="No podcasts found" description={`No results for "${query || genre || mood}"`} icon={FiSearch} />
        )
      )}

      {!query && !genre && !mood && !loading && (
        <EmptyState
          icon={FiSearch}
          title="Search for music"
          description="Try an artist name, album title, lyric fragment, genre, or one of the quick discovery chips above."
        />
      )}
    </div>
  );
};

export default Search;
