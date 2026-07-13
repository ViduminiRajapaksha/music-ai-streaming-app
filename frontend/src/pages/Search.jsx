import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { libraryService } from "../services/libraryService";
import { musicService } from "../services/musicService";
import {
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
import { FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";

const TABS = [
  { id: "songs", label: "Songs" },
  { id: "albums", label: "Albums" },
  { id: "artists", label: "Artists" },
  { id: "podcasts", label: "Podcasts" }
];

const MOODS = ["Happy", "Sad", "Energetic", "Calm", "Romantic", "Focus", "Party", "Chill"];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [genre, setGenre] = useState(searchParams.get("genre") || "");
  const [mood, setMood] = useState(searchParams.get("mood") || "");
  const [activeTab, setActiveTab] = useState("songs");
  const [results, setResults] = useState(null);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const didSearchFromParams = useRef(false);

  const performSearch = async ({ q = query, selectedGenre = genre, selectedMood = mood } = {}) => {
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
          ...(libraryData.artists || []).map(normalizeLibraryAlbum).filter(Boolean),
          ...(youtubeData.artists?.items || []).map(normalizeYouTubeArtist).filter(Boolean)
        ],
        podcasts: (libraryData.podcasts || []).map(normalizeLibraryPodcast).filter(Boolean)
      };

      const artistData = await libraryService.getArtists();
      setResults(combinedResults);
      setArtists(artistData);

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
  };

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
  }, []);

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
  const filteredArtists = artists.filter((artist) => {
    const q = query.trim().toLowerCase();
    return !q || artist.name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold mb-6">Search</h1>
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search songs, artists, albums..."
          autoFocus
        />
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-3">
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
        <div className="flex gap-2 border-b border-white/10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-spotify-green text-white"
                  : "border-transparent text-spotify-light hover:text-white"
              }`}
            >
              {tab.label}
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
        filteredArtists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredArtists.map((artist, i) => (
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
          title="Search for music"
          description="Find songs by name, artist, album, genre, or mood"
          icon={FiSearch}
        />
      )}
    </div>
  );
};

export default Search;
